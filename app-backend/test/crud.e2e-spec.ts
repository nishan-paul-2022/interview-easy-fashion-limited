import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('CRUD Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let customerToken: string;

  let adminId: string;
  let seedCategoryId: number;
  let seedStyleId: number;
  let seedSizeId: number;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be defined for e2e tests');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CloudinaryService)
      .useValue({
        uploadImage: jest
          .fn()
          .mockResolvedValue({ url: 'http://cloudinary.com/test.jpg', publicId: 'test_pub_id' }),
        deleteImage: jest.fn().mockResolvedValue(true),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Reset DB
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productSize.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.style.deleteMany();
    await prisma.size.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    await prisma.role.create({ data: { name: 'SUPER_ADMIN' } });
    await prisma.role.create({ data: { name: 'CUSTOMER' } });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Setup Users', () => {
    it('should register and login users', async () => {
      // 1. Create Roles
      await prisma.role.createMany({
        data: [{ name: 'SUPER_ADMIN' }, { name: 'CUSTOMER' }, { name: 'ADMIN' }],
        skipDuplicates: true,
      });

      // 2. Register Admin User
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'admin@example.com',
        fullName: 'Admin',
        password: 'Password123!',
      });
      // Force admin role directly in DB
      const adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { roleId: adminRole!.id },
      });
      const adminLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
        email: 'admin@example.com',
        password: 'Password123!',
      });
      adminToken = adminLogin.body.accessToken;
      adminId = adminLogin.body.user.id;

      // 3. Register Customer User
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'customer@example.com',
        fullName: 'Customer',
        password: 'Password123!',
      });
      const customerLogin = await request(app.getHttpServer()).post('/api/auth/login').send({
        email: 'customer@example.com',
        password: 'Password123!',
      });
      customerToken = customerLogin.body.accessToken;

      // Seed Category, Style, Size
      const cat = await prisma.category.create({ data: { name: 'InUse Category' } });
      seedCategoryId = cat.id;

      const sty = await prisma.style.create({ data: { name: 'Seed Style' } });
      seedStyleId = sty.id;

      const siz = await prisma.size.create({ data: { label: 'Seed Size' } });
      seedSizeId = siz.id;

      await prisma.product.create({
        data: {
          name: 'Seed Product',
          description: 'test',
          price: 10.0,
          categoryId: seedCategoryId,
          styleId: seedStyleId,
        },
      });
    });
  });

  describe('Categories (CRUD)', () => {
    let createdCategoryId: number;

    it('create category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Category', description: 'Desc' })
        .expect(201);
      createdCategoryId = res.body.id;
      expect(res.body.name).toBe('New Category');
    });

    it('list categories with search', async () => {
      const res = await request(app.getHttpServer()).get('/api/categories?search=New').expect(200);
      expect(res.body.data.some((c: { name: string }) => c.name === 'New Category')).toBeTruthy();
    });

    it('update category', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Category' })
        .expect(200);
      expect(res.body.name).toBe('Updated Category');
    });

    it('delete category - in-use -> 409', async () => {
      await request(app.getHttpServer())
        .delete(`/api/categories/${seedCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);
    });

    it('delete category - empty -> 200', async () => {
      await request(app.getHttpServer())
        .delete(`/api/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Products (CRUD)', () => {
    let createdProductId: number;

    it('create product with images', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        // We use .field and .attach for multipart/form-data
        .field('name', 'T-Shirt')
        .field('description', 'Nice shirt')
        .field('price', '29.99')
        .field('categoryId', seedCategoryId)
        .field('styleId', seedStyleId)
        .field('sizeIds', seedSizeId.toString())
        .attach('files', Buffer.from('fake_image_data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });
      if (res.status !== 201) {
        console.error(res.body);
      }
      expect(res.status).toBe(201);

      createdProductId = res.body.id;
      expect(res.body.images.length).toBeGreaterThan(0);
      expect(res.body.images[0].url).toContain('cloudinary.com');
    });

    it('get products with filters', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/products?search=T-Shirt&categoryId=${seedCategoryId}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toBe('T-Shirt');
    });

    it('delete product', async () => {
      await request(app.getHttpServer())
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Orders (CRUD)', () => {
    let orderId: string;

    it('create order (price recalculation)', async () => {
      // Create a product to order
      const prod = await prisma.product.create({
        data: {
          name: 'Orderable Product',
          description: 'test',
          price: 100, // DB PRICE IS 100
          categoryId: seedCategoryId,
          styleId: seedStyleId,
        },
      });

      const res = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerName: 'Customer',
          phone: '1234567890',
          shippingAddress: '123 Main St',
          items: [
            { productId: prod.id, quantity: 2, unitPrice: 10 }, // fake client price
          ],
        })
        .expect(201);

      orderId = res.body.id;
      // Should ignore the client's 10, use 100 * 2 = 200
      expect(Number(res.body.totalAmount)).toBe(200);
    });

    it('get /orders/me', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(orderId);
    });

    it('admin status update (invalid transition -> 400)', async () => {
      // First move to CANCELLED or DELIVERED, or DELIVERED directly
      // Actually standard invalid transition might be from PENDING to DELIVERED?
      // Wait, let's see what transitions are invalid in the backend.
      // If the backend prevents DELIVERED to CANCELLED for example. Let's try sending random string or a wrong sequence.
      // Usually, if we jump straight to DELIVERED, it might be allowed, but DELIVERED -> CANCELLED might be 400.
      // PENDING -> DELIVERED is an invalid transition according to orders.service.ts
      await request(app.getHttpServer())
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DELIVERED' })
        .expect(400);
    });
  });

  describe('Users (CRUD)', () => {
    let createdUserId: string;

    it('create user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newadmin@example.com',
          fullName: 'New Admin',
          password: 'Password123!',
          role: 'ADMIN',
        })
        .expect(201);

      createdUserId = res.body.id;
    });

    it('list users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('role change', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'CUSTOMER' })
        .expect(200);

      expect(res.body.role.name).toBe('CUSTOMER');
    });

    it('self-deactivation -> 403', async () => {
      await request(app.getHttpServer())
        .patch(`/api/users/${adminId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(403);
    });
  });
});
