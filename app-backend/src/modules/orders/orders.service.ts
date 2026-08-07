import { Injectable, BadRequestException } from '@nestjs/common';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: string | null) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = createOrderDto.items.map((item) => item.productId);

    // De-duplicate productIds in query just in case
    const uniqueProductIds = Array.from(new Set(productIds));
    const products = await this.prisma.product.findMany({
      where: { id: { in: uniqueProductIds }, isActive: true },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new BadRequestException('One or more products are invalid or inactive');
    }

    // Create a map for fast lookup of unit prices
    const productMap = new Map(products.map((p) => [p.id, Number(p.price)]));

    let totalAmount = 0;
    const validatedItems = createOrderDto.items.map((item) => {
      const unitPrice = productMap.get(item.productId);
      if (unitPrice === undefined) {
        throw new BadRequestException(`Product ID ${item.productId} is invalid`);
      }
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      };
    });

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          phone: createOrderDto.phone,
          shippingAddress: createOrderDto.shippingAddress,
          totalAmount,
          userId,
          orderItems: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });
  }

  async findMyOrders(userId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: {
            include: {
              product: true,
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
