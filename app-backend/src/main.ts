import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiVersion = process.env.API_VERSION || 'v1';
  app.setGlobalPrefix(`api/${apiVersion}`);
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

  const config = new DocumentBuilder()
    .setTitle('Easy Fashion API')
    .setDescription('The Easy Fashion API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('users')
    .addTag('categories')
    .addTag('sizes')
    .addTag('styles')
    .addTag('products')
    .addTag('orders')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`api/${apiVersion}/docs`, app, document);

  const port = process.env.BACKEND_PORT as string;
  await app.listen(port);
  Logger.log(`🚀 Backend is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
