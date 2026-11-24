import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shop } from '@/shop/entities/shop.entity';
import { ShopFollow } from './entities/shop-follow.entity';
import { ShopFollowService } from './shop-follow.service';
import { Repository } from 'typeorm';

describe('ShopFollowService', () => {
  let service: ShopFollowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopFollowService,
        {
          provide: getRepositoryToken(ShopFollow),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Shop),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ShopFollowService>(ShopFollowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('inserts a follow idempotently and returns the updated state', async () => {
    const insertBuilder = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const follows = {
      createQueryBuilder: jest.fn(() => insertBuilder),
      exist: jest.fn().mockResolvedValue(true),
      countBy: jest.fn().mockResolvedValue(3),
    };
    const shops = {
      findOne: jest.fn().mockResolvedValue({ id: '4' }),
    };
    const followService = new ShopFollowService(
      follows as unknown as Repository<ShopFollow>,
      shops as unknown as Repository<Shop>,
    );

    await expect(followService.follow('4', 9)).resolves.toEqual({
      is_following: true,
      follower_count: 3,
    });
    expect(insertBuilder.values).toHaveBeenCalledWith({
      shop_id: 4,
      user_id: 9,
    });
    expect(insertBuilder.orIgnore).toHaveBeenCalled();
  });
});
