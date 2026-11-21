import { Module } from '@nestjs/common';
import { ProductReviewService } from './product-review.service';
import { ProductReviewController } from './product-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from './entities/product-review.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReview, OrderItem, Product, Shop, Session]),
  ],
  controllers: [ProductReviewController],
  providers: [ProductReviewService],
})
export class ProductReviewModule {}
