import path from 'path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node ./prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
