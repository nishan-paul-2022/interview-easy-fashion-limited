import { Module } from '@nestjs/common';
import { BannersController } from '@/modules/banners/banners.controller';
import { BannersService } from '@/modules/banners/banners.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
