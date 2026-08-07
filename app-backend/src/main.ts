import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.BACKEND_PORT ?? 3015;
  await app.listen(port);
  Logger.log(`🚀 Backend is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
