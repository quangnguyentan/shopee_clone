import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { ApiCreatedResponse, ApiExtraModels } from '@nestjs/swagger';
import {
  CheckoutResponseDto,
  OrderItemSummaryDto,
  ShopOrderSummaryDto,
} from './dto/checkout-response.dto';

@ApiExtraModels(CheckoutResponseDto, ShopOrderSummaryDto, OrderItemSummaryDto)
@ApiControllerDocs('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiCreatedResponse({
    type: CheckoutResponseDto,
    description:
      'Expected parent-order and nested shop-order checkout response. The current OrderService is a scaffold and must be implemented to return this shape.',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
