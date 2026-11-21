import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { ShopService } from './shop.service';

describe('ShopService seller ownership', () => {
  const repo = {
    findOne: jest.fn(),
    save: jest.fn(),
    manager: { findOne: jest.fn() },
  };
  let service: ShopService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ShopService(repo as unknown as Repository<Shop>);
  });

  it('rejects a seller attempt to transfer shop ownership', async () => {
    repo.findOne.mockResolvedValue({
      id: 'shop-1',
      user: { id: '12' },
    });

    await expect(
      service.updateShop('shop-1', { userId: 12, role: 'seller' }, {
        user_id: 99,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('does not let sellers change administrative shop fields', async () => {
    const shop = {
      id: 'shop-1',
      user: { id: '12' },
      name: 'Old name',
      is_active: false,
      rating: 1,
    };
    repo.findOne.mockResolvedValue(shop);
    repo.save.mockImplementation((value) => Promise.resolve(value));

    const result = await service.updateShop(
      'shop-1',
      { userId: 12, role: 'seller' },
      { name: 'New name', is_active: true, rating: 5 },
    );

    expect(result.name).toBe('New name');
    expect(result.is_active).toBe(false);
    expect(result.rating).toBe(1);
  });
});
