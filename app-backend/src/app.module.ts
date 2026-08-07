import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/config/configuration';
import { envValidationSchema } from '@/config/env.validation';
import { HealthController } from '@/health.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
