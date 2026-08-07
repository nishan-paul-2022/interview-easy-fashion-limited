import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(helmet());

  const configService = app.get(ConfigService);
  const corsCustomer = configService.get<string>('cors.customerOrigin');
  const corsManagement = configService.get<string>('cors.managementOrigin');

  app.enableCors({
    origin: [corsCustomer, corsManagement].filter(Boolean) as string[],
    credentials: true,
  });

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
