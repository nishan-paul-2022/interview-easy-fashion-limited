import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Provider, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '@/common/utils/hash.util';
import { CreateUserDto } from '@/modules/auth/dto/create-user.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { TokenService } from '@/modules/auth/token.service';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
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
}
