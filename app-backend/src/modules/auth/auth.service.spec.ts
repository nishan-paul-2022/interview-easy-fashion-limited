import {
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from '@/modules/auth/auth.service';
import { TokenService } from '@/modules/auth/token.service';
import { UsersService } from '@/modules/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let tokenService: jest.Mocked<TokenService>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            updateRefreshTokenHash: jest.fn(),
            incrementFailedLoginAttempts: jest.fn(),
            lockUser: jest.fn(),
            resetFailedLoginAttempts: jest.fn(),
            logAudit: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            emailVerificationToken: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    tokenService = module.get(TokenService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const dto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: '1' } as never);
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should hash password and assign CUSTOMER role', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const createdUser = { id: '1', email: dto.email, passwordHash: 'hashed_password' };
      usersService.create.mockResolvedValue(createdUser as never);
      (prisma.emailVerificationToken.create as jest.Mock).mockResolvedValue(null as never);

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          passwordHash: 'hashed_password',
          role: { connect: { name: 'CUSTOMER' } },
        }),
      );

      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    const dto = { email: 'john@example.com', password: 'password123' };

    it('should return token pair on correct credentials', async () => {
      const user = {
        id: '1',
        email: dto.email,
        isActive: true,
        passwordHash: 'hashed',
        failedLoginAttempts: 0,
      };
      usersService.findByEmail.mockResolvedValue(user as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('refresh_hashed');

      tokenService.generateAccessToken.mockReturnValue('access_token');
      tokenService.generateRefreshToken.mockReturnValue('refresh_token');

      const result = await service.login(dto);

      expect(result.accessToken).toBe('access_token');
      expect(result.refreshToken).toBe('refresh_token');
      expect(usersService.resetFailedLoginAttempts).not.toHaveBeenCalled();
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith('1', 'refresh_hashed');
      expect(usersService.logAudit).toHaveBeenCalledWith(
        '1',
        AuditAction.LOGIN_SUCCESS,
        undefined,
        undefined,
      );
    });

    it('should throw UnauthorizedException and increment fail count on wrong password', async () => {
      const user = {
        id: '1',
        email: dto.email,
        isActive: true,
        passwordHash: 'hashed',
        failedLoginAttempts: 0,
      };
      usersService.findByEmail.mockResolvedValue(user as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersService.incrementFailedLoginAttempts.mockResolvedValue({
        ...user,
        failedLoginAttempts: 1,
      } as never);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.incrementFailedLoginAttempts).toHaveBeenCalledWith('1');
    });

    it('should lock account on 5th failed attempt', async () => {
      const user = {
        id: '1',
        email: dto.email,
        isActive: true,
        passwordHash: 'hashed',
        failedLoginAttempts: 4,
      };
      usersService.findByEmail.mockResolvedValue(user as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersService.incrementFailedLoginAttempts.mockResolvedValue({
        ...user,
        failedLoginAttempts: 5,
      } as never);

      await expect(service.login(dto)).rejects.toThrow(HttpException);
      expect(usersService.lockUser).toHaveBeenCalledWith('1', expect.any(Date));
    });

    it('should throw ForbiddenException if user is inactive', async () => {
      const user = { id: '1', email: dto.email, isActive: false };
      usersService.findByEmail.mockResolvedValue(user as never);

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw HttpException if account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 10000);
      const user = { id: '1', email: dto.email, isActive: true, lockedUntil };
      usersService.findByEmail.mockResolvedValue(user as never);

      await expect(service.login(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    it('should set refreshTokenHash to null', async () => {
      await service.logout('1', '127.0.0.1', 'user-agent');
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith('1', null);
      expect(usersService.logAudit).toHaveBeenCalledWith(
        '1',
        AuditAction.LOGOUT,
        '127.0.0.1',
        'user-agent',
      );
    });
  });

  describe('refresh', () => {
    it('should return new token pair on valid token', async () => {
      const user = { id: '1', refreshTokenHash: 'hashed_refresh', isActive: true };
      usersService.findById.mockResolvedValue(user as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_refresh');
      tokenService.generateAccessToken.mockReturnValue('new_access');
      tokenService.generateRefreshToken.mockReturnValue('new_refresh');

      const result = await service.refresh('1', 'valid_token');

      expect(result.accessToken).toBe('new_access');
      expect(result.refreshToken).toBe('new_refresh');
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith('1', 'new_hashed_refresh');
    });

    it('should clear hash and throw UnauthorizedException on reused token', async () => {
      const user = { id: '1', refreshTokenHash: 'hashed_refresh', isActive: true };
      usersService.findById.mockResolvedValue(user as never);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('1', 'reused_token')).rejects.toThrow(UnauthorizedException);
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith('1', null);
    });
  });
});
