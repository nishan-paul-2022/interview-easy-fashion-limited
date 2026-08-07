import { Injectable } from '@nestjs/common';
import { Prisma, Provider } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
}
