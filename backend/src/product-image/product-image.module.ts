import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { ProductImage } from './entities/product-image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/product/entities/product.entity';
import { Session } from '@/session/entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductImage, Product, Session])],
  controllers: [ProductImageController],
  providers: [ProductImageService],
})
export class ProductImageModule {}
