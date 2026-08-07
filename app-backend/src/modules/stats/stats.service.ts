import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryStats() {
    const [totalCategories, totalProducts, totalSizes, totalStyles] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.product.count(),
      this.prisma.size.count(),
      this.prisma.style.count(),
    ]);

    return {
      totalCategories,
      totalProducts,
      totalSizes,
      totalStyles,
    };
  }
}
