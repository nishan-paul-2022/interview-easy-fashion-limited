import { Module } from '@nestjs/common';
import { StylesController } from '@/modules/styles/styles.controller';
import { StylesService } from '@/modules/styles/styles.service';

@Module({
  controllers: [StylesController],
  providers: [StylesService],
  exports: [StylesService],
})
export class StylesModule {}
