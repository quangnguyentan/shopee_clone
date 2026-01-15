import { Test, TestingModule } from '@nestjs/testing';
import { FlashSaleItemService } from './flash-sale-item.service';

describe('FlashSaleItemService', () => {
  let service: FlashSaleItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlashSaleItemService],
    }).compile();

    service = module.get<FlashSaleItemService>(FlashSaleItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
