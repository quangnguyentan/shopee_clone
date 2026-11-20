import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from 'src/product/entities/product.entity';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { Session } from '@/session/entities/session.entity';
import { InventoryReservation } from '@/inventory-reservation/entities/inventory-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariant,
      Product,
      Session,
      InventoryReservation,
    ]),
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService],
  exports: [ProductVariantService],
})
export class ProductVariantModule {}
