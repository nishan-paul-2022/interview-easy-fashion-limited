import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private extractPublicId(url: string): string {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    const fileWithExtension = parts.slice(uploadIndex + 2).join('/');
    return fileWithExtension.replace(/\.[^/.]+$/, '');
  }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
    // Upload images to Cloudinary
    let uploadedImages: { url: string; publicId: string }[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadImage(file.buffer, 'products'),
      );
      uploadedImages = await Promise.all(uploadPromises);
    }

    // Create product, sizes, and images in a single transaction
    return this.prisma.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          categoryId: createProductDto.categoryId,
          styleId: createProductDto.styleId,
          isActive: createProductDto.isActive ?? true,
          productSizes: {
            create: createProductDto.sizeIds.map((sizeId) => ({
              size: { connect: { id: sizeId } },
            })),
          },
          images: {
            create: uploadedImages.map((img, idx) => ({
              url: img.url,
              isPrimary: idx === 0,
            })),
          },
        },
        include: {
          images: true,
          productSizes: { include: { size: true } },
          category: true,
          style: true,
        },
      });
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        productSizes: { include: { size: true } },
        category: true,
        style: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let uploadedImages: { url: string; publicId: string }[] = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadImage(file.buffer, 'products'),
      );
      uploadedImages = await Promise.all(uploadPromises);

      const deletePromises = product.images.map((img) => {
        const publicId = this.extractPublicId(img.url);
        return this.cloudinaryService.deleteImage(publicId).catch((e) => console.error(e));
      });
      await Promise.all(deletePromises);
    }

    return this.prisma.$transaction(async (tx) => {
      if (updateProductDto.sizeIds) {
        await tx.productSize.deleteMany({ where: { productId: id } });
      }
      if (files && files.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(updateProductDto.name && { name: updateProductDto.name }),
          ...(updateProductDto.description && { description: updateProductDto.description }),
          ...(updateProductDto.price && { price: updateProductDto.price }),
          ...(updateProductDto.categoryId && { categoryId: updateProductDto.categoryId }),
          ...(updateProductDto.styleId && { styleId: updateProductDto.styleId }),
          ...(updateProductDto.isActive !== undefined && { isActive: updateProductDto.isActive }),
          ...(updateProductDto.sizeIds && {
            productSizes: {
              create: updateProductDto.sizeIds.map((sizeId) => ({
                size: { connect: { id: sizeId } },
              })),
            },
          }),
          ...(files &&
            files.length > 0 && {
              images: {
                create: uploadedImages.map((img, idx) => ({
                  url: img.url,
                  isPrimary: idx === 0,
                })),
              },
            }),
        },
        include: {
          images: true,
          productSizes: { include: { size: true } },
          category: true,
          style: true,
        },
      });
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const deletePromises = product.images.map((img) => {
      const publicId = this.extractPublicId(img.url);
      return this.cloudinaryService.deleteImage(publicId).catch((e) => console.error(e));
    });
    await Promise.all(deletePromises);

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productSize.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });
  }
}
