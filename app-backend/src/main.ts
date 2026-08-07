import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );

  const port = process.env.BACKEND_PORT ?? 3015;
  await app.listen(port);
  Logger.log(`🚀 Backend is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
