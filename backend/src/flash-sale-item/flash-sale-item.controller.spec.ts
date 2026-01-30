import { Test, TestingModule } from '@nestjs/testing';
import { FlashSaleItemController } from './flash-sale-item.controller';
import { FlashSaleItemService } from './flash-sale-item.service';

describe('FlashSaleItemController', () => {
  let controller: FlashSaleItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashSaleItemController],
      providers: [FlashSaleItemService],
    }).compile();

    controller = module.get<FlashSaleItemController>(FlashSaleItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
