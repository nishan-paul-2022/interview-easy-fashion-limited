import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateStyleDto } from '@/modules/styles/dto/create-style.dto';
import { StyleQueryDto } from '@/modules/styles/dto/style-query.dto';
import { UpdateStyleDto } from '@/modules/styles/dto/update-style.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StylesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStyleDto: CreateStyleDto) {
    try {
      return await this.prisma.style.create({
        data: createStyleDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Style name already exists');
      }
      throw error;
    }
  }

  async findAll(query: StyleQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StyleWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.style.count({ where }),
      this.prisma.style.findMany({
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
    const style = await this.prisma.style.findUnique({
      where: { id },
    });
    if (!style) {
      throw new NotFoundException(`Style with ID ${id} not found`);
    }
    return style;
  }

  async update(id: number, updateStyleDto: UpdateStyleDto) {
    await this.findOne(id);
    try {
      return await this.prisma.style.update({
        where: { id },
        data: updateStyleDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Style name already exists');
      }
      throw error;
    }
  }

  async remove(id: number) {
    const style = await this.prisma.style.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!style) {
      throw new NotFoundException(`Style with ID ${id} not found`);
    }

    if (style._count.products > 0) {
      throw new ConflictException(
        `Cannot delete style because it is associated with ${style._count.products} products`,
      );
    }

    return this.prisma.style.delete({
      where: { id },
    });
  }
}
