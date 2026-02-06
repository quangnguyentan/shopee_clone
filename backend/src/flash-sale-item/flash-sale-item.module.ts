import { Module } from '@nestjs/common';
import { FlashSaleItemService } from './flash-sale-item.service';
import { FlashSaleItemController } from './flash-sale-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSale } from '@/flash-sale/entities/flash-sale.entity';
import { FlashSaleItem } from './entities/flash-sale-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSale, FlashSaleItem])],
  controllers: [FlashSaleItemController],
  providers: [FlashSaleItemService],
})
export class FlashSaleItemModule {}
