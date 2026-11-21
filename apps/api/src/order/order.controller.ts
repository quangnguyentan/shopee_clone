import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { ApiExtraModels } from '@nestjs/swagger';
import {
  CheckoutResponseDto,
  OrderItemSummaryDto,
  ShopOrderSummaryDto,
} from './dto/checkout-response.dto';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiAuthenticated } from '@/common/decorators/api-controller-docs.decorator';
import { PaginationDto } from '@/base/base.dto';
import { UpdateSellerOrderStatusDto } from './dto/update-seller-order-status.dto';

@ApiExtraModels(CheckoutResponseDto, ShopOrderSummaryDto, OrderItemSummaryDto)
@ApiControllerDocs('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @AuthRole('buyer')
  create() {
    return this.orderService.create();
  }

  @AuthRole('admin', 'seller')
  @Get()
  @ApiAuthenticated()
  findAll(
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
    @Query() query: PaginationDto,
  ) {
    return this.orderService.findAll(user, query);
  }

  @AuthRole('admin', 'seller')
  @Patch('seller/shop-orders/:id/status')
  @ApiAuthenticated()
  updateSellerOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSellerOrderStatusDto,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.orderService.updateSellerOrderStatus(id, dto, user);
  }

  @AuthRole('admin', 'seller')
  @Get(':id')
  @ApiAuthenticated()
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.orderService.findOne(id, user);
  }

  @AuthRole('admin')
  @Patch(':id')
  @ApiAuthenticated()
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: { userId: number; role: 'admin' },
  ) {
    return this.orderService.updateAdminOrder(id, updateOrderDto, user);
  }

  @AuthRole('admin')
  @Delete(':id')
  @ApiAuthenticated()
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
