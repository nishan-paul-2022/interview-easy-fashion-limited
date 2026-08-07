import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@/modules/auth/guards/optional-jwt-auth.guard';
import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
import { OrdersService } from '@/modules/orders/orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: { id: string } | null) {
    const userId = user?.id || null;
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findMyOrders(@Query() query: PaginationQueryDto, @CurrentUser() user: { id: string }) {
    return this.ordersService.findMyOrders(user.id, query);
  }
}
