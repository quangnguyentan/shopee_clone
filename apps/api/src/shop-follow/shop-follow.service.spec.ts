import { Test, TestingModule } from '@nestjs/testing';
import { ShopFollowService } from './shop-follow.service';

describe('ShopFollowService', () => {
  let service: ShopFollowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopFollowService],
    }).compile();

    service = module.get<ShopFollowService>(ShopFollowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
