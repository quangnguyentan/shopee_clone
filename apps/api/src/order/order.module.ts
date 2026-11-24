import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { OrderStatusHistory } from '@/order-status-history/entities/order-status-history.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { Session } from '@/session/entities/session.entity';
import { PaymentModule } from '@/payment/payment.module';
import { Cart } from '@/cart/entities/cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { ProductVariantAttribute } from '@/product-variant-attributes/entities/product-variant-attribute.entity';
import { Product } from '@/product/entities/product.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { InventoryReservation } from '@/inventory-reservation/entities/inventory-reservation.entity';

@Module({
  imports: [
    PaymentModule,
    TypeOrmModule.forFeature([
      Order,
      ShopOrder,
      OrderStatusHistory,
      Shop,
      Session,
      Cart,
      CartItem,
      Product,
      ProductVariant,
      ProductVariantAttribute,
      OrderItem,
      InventoryReservation,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
