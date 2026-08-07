import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogQueryDto } from '@/modules/dashboard/dto/audit-log-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [totalUsers, totalCategories, totalProducts, totalOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.category.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
    ]);

    return {
      totalUsers,
      totalCategories,
      totalProducts,
      totalOrders,
    };
  }

  async getLoginActivity(query: AuditLogQueryDto) {
    const { page = 1, limit = 10, action, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
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
}
