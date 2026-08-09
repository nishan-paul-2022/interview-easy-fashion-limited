import * as path from 'path';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, OrderStatus, AuditAction, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🧹 Cleaning existing data...');
    // Delete in order to satisfy foreign key constraints
    await prisma.auditLog.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.productSize.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.size.deleteMany({});
    await prisma.style.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.emailVerificationToken.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});

    console.log('🌱 Seeding roles...');
    // 1. Seed Roles
    const roleNames = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'];
    const roles: Record<string, Role> = {};
    for (const name of roleNames) {
      roles[name] = await prisma.role.create({ data: { name } });
    }

    console.log('🌱 Seeding default users...');
    // 2. Seed Super Admin, Admin, and Manager
    const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@easyfashion.com';
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        fullName: 'System Administrator',
        passwordHash,
        roleId: roles['SUPER_ADMIN'].id,
        isActive: true,
      },
    });
    console.log(`Created Super Admin: ${superAdmin.email}`);

    // Create 2 additional Admins and 2 Managers
    const adminStaff = [
      { email: 'john.admin@easyfashion.com', fullName: 'John Admin', roleName: 'ADMIN' },
      { email: 'jane.admin@easyfashion.com', fullName: 'Jane Admin', roleName: 'ADMIN' },
      { email: 'alice.manager@easyfashion.com', fullName: 'Alice Manager', roleName: 'MANAGER' },
      { email: 'bob.manager@easyfashion.com', fullName: 'Bob Manager', roleName: 'MANAGER' },
    ];

    for (const staff of adminStaff) {
      await prisma.user.create({
        data: {
          email: staff.email,
          fullName: staff.fullName,
          passwordHash,
          roleId: roles[staff.roleName].id,
          isActive: true,
        },
      });
    }
    console.log('Created admin and manager staff.');

    // 3. Seed 100 Customers
    console.log('🌱 Seeding 100 customer users...');
    const customers = [];
    for (let i = 0; i < 100; i++) {
      const customer = await prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          fullName: faker.person.fullName(),
          phone: faker.phone.number(),
          passwordHash,
          roleId: roles['CUSTOMER'].id,
          isActive: faker.datatype.boolean({ probability: 0.92 }), // 92% active
          createdAt: faker.date.past({ years: 1 }),
        },
      });
      customers.push(customer);
    }

    // 4. Seed Categories
    console.log('🌱 Seeding categories...');
    const categoryNames = [
      'Tops',
      'Jeans',
      'Outerwear',
      'Footwear',
      'Accessories',
      'Activewear',
      'Suits & Formal',
      'Dresses',
      'Sleepwear',
      'Hats',
    ];
    const categories = [];
    for (const name of categoryNames) {
      const cat = await prisma.category.create({
        data: {
          name,
          description: faker.commerce.productDescription(),
          isActive: true,
        },
      });
      categories.push(cat);
    }

    // 5. Seed Sizes
    console.log('🌱 Seeding sizes...');
    const sizeLabels = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const sizes = [];
    for (const label of sizeLabels) {
      const s = await prisma.size.create({ data: { label } });
      sizes.push(s);
    }

    // 6. Seed Styles
    console.log('🌱 Seeding styles...');
    const styleNames = [
      'Casual',
      'Formal',
      'Streetwear',
      'Vintage',
      'Minimalist',
      'Bohemian',
      'Sporty',
    ];
    const styles = [];
    for (const name of styleNames) {
      const st = await prisma.style.create({ data: { name } });
      styles.push(st);
    }

    // 7. Seed Products (Ensuring multiple products for every category-style combination)
    console.log('🌱 Seeding 420 products (6 per Category-Style combination)...');
    const products = [];
    const garmentTypes = [
      'Shirt',
      'T-Shirt',
      'Pants',
      'Jacket',
      'Coat',
      'Sneakers',
      'Hat',
      'Dress',
      'Sweater',
      'Hoodie',
    ];

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'hkzrv0ol';
    const SEED_IMAGES = [
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260048/easy-fashion-seed/yellow-dress.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260048/easy-fashion-seed/fashion-bags.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260049/easy-fashion-seed/clothes-rack.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260050/easy-fashion-seed/streetwear-coat.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260051/easy-fashion-seed/model-jacket.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260051/easy-fashion-seed/floral-dress.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260052/easy-fashion-seed/red-sweater.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260053/easy-fashion-seed/mens-suit.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260053/easy-fashion-seed/white-shirt.jpg`,
      `https://res.cloudinary.com/${cloudName}/image/upload/v1786260054/easy-fashion-seed/red-sneaker.jpg`,
    ];

    const productsPerCombination = 6;
    for (const category of categories) {
      for (const style of styles) {
        for (let k = 0; k < productsPerCombination; k++) {
          const randomType = faker.helpers.arrayElement(garmentTypes);
          const productName = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${randomType}`;

          const product = await prisma.product.create({
            data: {
              name: productName,
              description: faker.commerce.productDescription(),
              price: parseFloat(faker.commerce.price({ min: 15, max: 250 })),
              categoryId: category.id,
              styleId: style.id,
              isActive: faker.datatype.boolean({ probability: 0.95 }),
            },
          });

          // Product Images (1-3 images)
          const imageCount = faker.number.int({ min: 1, max: 3 });
          const chosenImages = faker.helpers.arrayElements(SEED_IMAGES, imageCount);
          for (let j = 0; j < imageCount; j++) {
            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: chosenImages[j],
                isPrimary: j === 0,
              },
            });
          }

          // Product Sizes (2-5 random sizes)
          const productSizes = faker.helpers.arrayElements(sizes, { min: 2, max: 5 });
          for (const size of productSizes) {
            await prisma.productSize.create({
              data: {
                productId: product.id,
                sizeId: size.id,
              },
            });
          }

          products.push(product);
        }
      }
    }

    // 8. Seed 300 Orders
    console.log('🌱 Seeding 300 orders...');
    const statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    for (let i = 0; i < 300; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const status = faker.helpers.arrayElement(statuses);
      const orderDate = faker.date.past({ years: 1 });

      // Determine order items (1-4 products)
      const orderProducts = faker.helpers.arrayElements(products, { min: 1, max: 4 });
      const itemsData = [];
      let totalAmount = 0;

      for (const prod of orderProducts) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = Number(prod.price);
        const subtotal = price * quantity;
        totalAmount += subtotal;

        itemsData.push({
          productId: prod.id,
          quantity,
          unitPrice: price,
          subtotal,
        });
      }

      await prisma.order.create({
        data: {
          customerName: customer.fullName,
          phone: customer.phone || faker.phone.number(),
          shippingAddress: faker.location.streetAddress({ useFullAddress: true }),
          status,
          totalAmount,
          userId: customer.id,
          createdAt: orderDate,
          updatedAt: orderDate,
          orderItems: {
            create: itemsData,
          },
        },
      });
    }

    // 9. Seed 500 Audit Logs
    console.log('🌱 Seeding 500 audit logs...');
    const auditActions: AuditAction[] = [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'LOGOUT',
      'PASSWORD_RESET',
    ];
    for (let i = 0; i < 500; i++) {
      const user = faker.helpers.arrayElement(customers);
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: faker.helpers.arrayElement(auditActions),
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
