import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '@/order/entities/order.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { InventoryReservation } from '@/inventory-reservation/entities/inventory-reservation.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Order,
      ShopOrder,
      InventoryReservation,
      ProductVariant,
      Session
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }
