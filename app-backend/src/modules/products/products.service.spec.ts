import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { ProductsService } from '@/modules/products/products.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: jest.Mocked<PrismaService>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService);
    cloudinaryService = module.get(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should verify transaction includes ProductImage and ProductSize creation', async () => {
      const createDto = {
        name: 'T-Shirt',
        description: 'Cotton',
        price: 20,
        categoryId: 1,
        styleId: 1,
        isActive: true,
        sizeIds: [1, 2],
      };

      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      cloudinaryService.uploadImage.mockResolvedValue({ url: 'http://img.url', publicId: '123' });

      const txMock = {
        product: {
          create: jest.fn().mockResolvedValue({ id: 1 } as never),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(txMock));

      await service.create(createDto as never, [file]);

      expect(cloudinaryService.uploadImage).toHaveBeenCalled();
      expect(txMock.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'T-Shirt',
            productSizes: {
              create: [{ size: { connect: { id: 1 } } }, { size: { connect: { id: 2 } } }],
            },
            images: {
              create: [{ url: 'http://img.url', isPrimary: true }],
            },
          }),
        }),
      );
    });
  });
});
