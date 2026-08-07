import { Module } from '@nestjs/common';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
