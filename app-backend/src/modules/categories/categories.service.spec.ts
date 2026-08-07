import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '@/modules/categories/categories.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('remove', () => {
    it('should throw NotFoundException if category not found', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null as never);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if category is in use', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        _count: { products: 5 },
      } as never);
      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });

    it('should delete category if not in use', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        _count: { products: 0 },
      } as never);
      (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 1 } as never);

      await service.remove(1);
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
