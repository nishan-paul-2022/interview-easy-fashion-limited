import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from '@/config/configuration';
import { envValidationSchema } from '@/config/env.validation';
import { HealthController } from '@/health.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';
import { ProductsModule } from '@/modules/products/products.module';
import { SizesModule } from '@/modules/sizes/sizes.module';
import { StylesModule } from '@/modules/styles/styles.module';
import { UsersModule } from '@/modules/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    SizesModule,
    StylesModule,
    CloudinaryModule,
    ProductsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
