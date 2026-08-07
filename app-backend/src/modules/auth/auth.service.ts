import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException(
        { message: 'Account locked', lockedUntil: user.lockedUntil },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const refreshTokenHash = await hashPassword(refreshToken);
    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

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
}
