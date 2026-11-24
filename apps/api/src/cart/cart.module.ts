import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { Session } from '@/session/entities/session.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Session, ProductVariant]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
