import { Injectable } from '@nestjs/common';
import { Prisma, Provider, AuditAction } from '@prisma/client';
import { RoleName } from '@/common/enums/role-name.enum';
import { hashPassword } from '@/common/utils/hash.util';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UserQueryDto } from '@/modules/users/dto/user-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async createDashboardUser(dto: CreateUserDto) {
    const { password, role, ...rest } = dto;
    const passwordHash = await hashPassword(password);

    return this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
        role: { connect: { name: role } },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = { name: role };
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          role: true,
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByIdSafe(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });
  }

  async updateSafe(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async updateStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        isActive: true,
      },
    });
  }

  async updateRole(id: string, role: RoleName) {
    return this.prisma.user.update({
      where: { id },
      data: { role: { connect: { name: role } } },
      select: {
        id: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findByProviderId(provider: Provider, providerId: string) {
    return this.prisma.user.findFirst({
      where: { provider, providerId },
      include: { role: true },
    });
  }

  async create(dto: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateRefreshTokenHash(id: string, hash: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash: hash },
    });
  }

  async incrementFailedLoginAttempts(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  async lockUser(id: string, lockUntil: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { lockedUntil: lockUntil },
    });
  }

  async resetFailedLoginAttempts(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async logAudit(
    userId: string | null,
    action: AuditAction,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
      },
    });
  }
}
