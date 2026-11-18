import { Module } from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import { FlashSaleController } from './flash-sale.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { FlashSaleItem } from '@/flash-sale-item/entities/flash-sale-item.entity';
import { FlashSale } from './entities/flash-sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant, FlashSaleItem, FlashSale]),
  ],
  controllers: [FlashSaleController],
  providers: [FlashSaleService],
})
export class FlashSaleModule {}
