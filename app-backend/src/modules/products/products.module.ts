import { Module } from '@nestjs/common';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';
import { ProductsController } from '@/modules/products/products.controller';
import { ProductsService } from '@/modules/products/products.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
