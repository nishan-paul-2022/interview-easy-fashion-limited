import { Module } from '@nestjs/common';
import { SizesController } from '@/modules/sizes/sizes.controller';
import { SizesService } from '@/modules/sizes/sizes.service';

@Module({
  controllers: [SizesController],
  providers: [SizesService],
  exports: [SizesService],
})
export class SizesModule {}
