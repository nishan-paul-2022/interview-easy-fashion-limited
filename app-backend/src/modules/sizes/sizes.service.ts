import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateSizeDto } from '@/modules/sizes/dto/create-size.dto';
import { SizeQueryDto } from '@/modules/sizes/dto/size-query.dto';
import { UpdateSizeDto } from '@/modules/sizes/dto/update-size.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SizesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSizeDto: CreateSizeDto) {
    try {
      return await this.prisma.size.create({
        data: createSizeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Size label already exists');
      }
      throw error;
    }
  }

  async findAll(query: SizeQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SizeWhereInput = {};
    if (search) {
      where.label = { contains: search, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.size.count({ where }),
      this.prisma.size.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const size = await this.prisma.size.findUnique({
      where: { id },
    });
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    return size;
  }

  async update(id: number, updateSizeDto: UpdateSizeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.size.update({
        where: { id },
        data: updateSizeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Size label already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    const size = await this.prisma.size.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productSizes: true },
        },
      },
    });

    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }

    if (size._count.productSizes > 0) {
      throw new ConflictException(
        `Cannot delete size because it is associated with ${size._count.productSizes} products`,
      );
    }

    return this.prisma.size.delete({
      where: { id },
    });
  }
}
