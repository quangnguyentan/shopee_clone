import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { OrderStatusHistory } from '@/order-status-history/entities/order-status-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, ShopOrder, OrderStatusHistory])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
