import * as crypto from 'crypto';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Provider, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '@/common/utils/hash.util';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { CreateUserDto } from '@/modules/auth/dto/create-user.dto';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { VerifyEmailDto } from '@/modules/auth/dto/verify-email.dto';
import { TokenService } from '@/modules/auth/token.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash: hashedPassword,
      role: {
        connect: { name: 'CUSTOMER' },
      },
    });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: verifyTokenHash,
        expiresAt,
      },
    });

    const verifyLink = `http://localhost:3015/verify-email?token=${verifyToken}&email=${user.email}`;
    console.log(`[DEV ONLY] Email verification link for ${user.email}: ${verifyLink}`);
    // TODO: wire real email provider

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      await this.usersService.logAudit(null, AuditAction.LOGIN_FAILURE, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.usersService.logAudit(user.id, AuditAction.LOGIN_FAILURE, ipAddress, userAgent);
      throw new HttpException(
        { message: 'Account locked', lockedUntil: user.lockedUntil },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!user.isActive) {
      await this.usersService.logAudit(user.id, AuditAction.LOGIN_FAILURE, ipAddress, userAgent);
      throw new ForbiddenException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isPasswordValid) {
      await this.usersService.logAudit(user.id, AuditAction.LOGIN_FAILURE, ipAddress, userAgent);
      const updatedUser = await this.usersService.incrementFailedLoginAttempts(user.id);
      if (updatedUser.failedLoginAttempts >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000);
        await this.usersService.lockUser(user.id, lockTime);
        throw new HttpException(
          { message: 'Account locked due to too many failed attempts', lockedUntil: lockTime },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.failedLoginAttempts > 0) {
      await this.usersService.resetFailedLoginAttempts(user.id);
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const refreshTokenHash = await hashPassword(refreshToken);
    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    await this.usersService.logAudit(user.id, AuditAction.LOGIN_SUCCESS, ipAddress, userAgent);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, refreshTokenHash: _rfHash, ...result } = user;
    return {
      accessToken,
      refreshToken,
      user: result,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: 'If that email is registered, a password reset link was sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetLink = `http://localhost:3015/reset-password?token=${resetToken}&email=${user.email}`;
    console.log(`[DEV ONLY] Password reset link for ${user.email}: ${resetLink}`);
    // TODO: wire real email provider

    return { message: 'If that email is registered, a password reset link was sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { passwordResetTokens: { where: { used: false } } },
    });

    if (!user) {
      throw new BadRequestException('Invalid token or expired');
    }

    let validTokenRecord = null;
    for (const record of user.passwordResetTokens) {
      if (record.expiresAt > new Date()) {
        const isValid = await bcrypt.compare(token, record.tokenHash);
        if (isValid) {
          validTokenRecord = record;
          break;
        }
      }
    }

    if (!validTokenRecord) {
      throw new BadRequestException('Invalid token or expired');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.update({
        where: { id: validTokenRecord.id },
        data: { used: true },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          refreshTokenHash: null,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET',
        },
      });
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, token } = verifyEmailDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { emailVerificationTokens: { where: { used: false } } },
    });

    if (!user) {
      throw new BadRequestException('Invalid token or expired');
    }

    let validTokenRecord = null;
    for (const record of user.emailVerificationTokens) {
      if (record.expiresAt > new Date()) {
        const isValid = await bcrypt.compare(token, record.tokenHash);
        if (isValid) {
          validTokenRecord = record;
          break;
        }
      }
    }

    if (!validTokenRecord) {
      throw new BadRequestException('Invalid token or expired');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: { id: validTokenRecord.id },
        data: { used: true },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    });

    return { message: 'Email verified successfully' };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, refreshTokenHash: _rf, ...result } = user;
    return result;
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      await this.usersService.updateRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Invalid refresh token (reuse detected)');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = this.tokenService.generateRefreshToken(user);

    const newRefreshTokenHash = await hashPassword(newRefreshToken);
    await this.usersService.updateRefreshTokenHash(user.id, newRefreshTokenHash);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    await this.usersService.logAudit(userId, AuditAction.LOGOUT, ipAddress, userAgent);
  }

  async oauthLogin(
    provider: Provider,
    profile: { providerId: string; email: string; fullName: string },
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!profile.email) {
      await this.usersService.logAudit(null, AuditAction.LOGIN_FAILURE, ipAddress, userAgent);
      throw new UnauthorizedException(`No email provided by ${provider}`);
    }

    let user = await this.usersService.findByProviderId(provider, profile.providerId);

    if (!user) {
      user = await this.usersService.findByEmail(profile.email);
      if (!user) {
        const createdUser = await this.usersService.create({
          fullName: profile.fullName,
          email: profile.email,
          provider: provider,
          providerId: profile.providerId,
          role: { connect: { name: 'CUSTOMER' } },
        });
        user = await this.usersService.findById(createdUser.id);
      } else {
        await this.usersService.update(user.id, {
          provider: provider,
          providerId: profile.providerId,
        });
        user = await this.usersService.findById(user.id);
      }
    }

    const accessToken = this.tokenService.generateAccessToken(user!);
    const newRefreshToken = this.tokenService.generateRefreshToken(user!);

    const newRefreshTokenHash = await hashPassword(newRefreshToken);
    await this.usersService.updateRefreshTokenHash(user!.id, newRefreshTokenHash);

    await this.usersService.logAudit(user!.id, AuditAction.LOGIN_SUCCESS, ipAddress, userAgent);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, refreshTokenHash: _rf, ...result } = user!;
    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: result,
    };
  }

  async googleLogin(
    profile: { providerId: string; email: string; fullName: string },
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.oauthLogin(Provider.GOOGLE, profile, ipAddress, userAgent);
  }

  async facebookLogin(
    profile: { providerId: string; email: string; fullName: string },
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.oauthLogin(Provider.FACEBOOK, profile, ipAddress, userAgent);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash || '');
    if (!isMatch) {
      throw new BadRequestException('Invalid current password');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        refreshTokenHash: null,
      },
    });

    return { message: 'Password changed successfully' };
  }
}
