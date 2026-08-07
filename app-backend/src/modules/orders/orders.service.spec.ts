import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '@/modules/orders/orders.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto = {
      customerName: 'John',
      phone: '123',
      shippingAddress: 'Address',
      items: [{ productId: 1, quantity: 2 }],
    };

    it('should throw BadRequestException for invalid productId', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([] as never);

      await expect(service.create(createOrderDto, null)).rejects.toThrow(BadRequestException);
    });

    it('should recalculate price server-side and create order', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { id: 1, price: 50, isActive: true },
      ] as never);

      const txMock = {
        order: {
          create: jest.fn().mockResolvedValue({ id: 'order-1' } as never),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(txMock));

      await service.create(createOrderDto, 'user-1');

      expect(txMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 100,
            userId: 'user-1',
            orderItems: {
              create: [
                {
                  productId: 1,
                  quantity: 2,
                  unitPrice: 50,
                  subtotal: 100,
                },
              ],
            },
          }),
        }),
      );
    });
  });
});
