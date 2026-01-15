import { Test, TestingModule } from '@nestjs/testing';
import { ShopFollowController } from './shop-follow.controller';
import { ShopFollowService } from './shop-follow.service';

describe('ShopFollowController', () => {
  let controller: ShopFollowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopFollowController],
      providers: [ShopFollowService],
    }).compile();

    controller = module.get<ShopFollowController>(ShopFollowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
