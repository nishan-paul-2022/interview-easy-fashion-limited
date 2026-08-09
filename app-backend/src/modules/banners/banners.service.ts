import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
  }
}
