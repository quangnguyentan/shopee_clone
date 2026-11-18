import { Module } from '@nestjs/common';
import { ProductReviewService } from './product-review.service';
import { ProductReviewController } from './product-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from './entities/product-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductReview])],
  controllers: [ProductReviewController],
  providers: [ProductReviewService],
})
export class ProductReviewModule {}
