import { Module } from '@nestjs/common';
import { FlashSaleItemService } from './flash-sale-item.service';
import { FlashSaleItemController } from './flash-sale-item.controller';

@Module({
  controllers: [FlashSaleItemController],
  providers: [FlashSaleItemService],
})
export class FlashSaleItemModule {}
