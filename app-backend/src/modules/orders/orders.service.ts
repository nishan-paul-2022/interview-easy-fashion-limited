import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: number | null) {
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
      totalAmount += unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
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
}
