import * as path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
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
    // 1. Upsert Roles
    const roles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'];
    for (const roleName of roles) {
      await prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
      console.log(`Upserted role: ${roleName}`);
    }

    // 2. Upsert Super Admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      throw new Error('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD missing in environment');
    }

    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found after upsert');
    }

    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    const superAdminUser = await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        passwordHash,
        roleId: superAdminRole.id,
      },
      create: {
        email: superAdminEmail,
        fullName: 'System Administrator',
        passwordHash,
        roleId: superAdminRole.id,
        isActive: true,
      },
    });

    console.log(`Upserted super admin user: ${superAdminUser.email}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
