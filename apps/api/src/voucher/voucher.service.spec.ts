import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Shop } from '@/shop/entities/shop.entity';
import { Voucher } from './entities/voucher.entity';
import { VoucherRedemption } from './entities/voucher-redemption.entity';
import { VoucherScope } from '@/common/enums/marketplace.enums';
import { VoucherService } from './voucher.service';

describe('VoucherService', () => {
  it('creates seller vouchers for the authenticated seller shop', async () => {
    const voucherRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((voucher) => voucher),
      save: jest.fn((voucher) => Promise.resolve(voucher)),
    };
    const shopRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'owned-shop' }),
    };
    const redemptionRepo = { count: jest.fn() };
    const service = new VoucherService(
      voucherRepo as unknown as Repository<Voucher>,
      shopRepo as unknown as Repository<Shop>,
      redemptionRepo as unknown as Repository<VoucherRedemption>,
    );

    await service.create(
      {
        code: 'save10',
        scope: VoucherScope.SHOP,
        shop_id: '999',
        discount_type: 'percent',
        discount_value: 10,
        expired_at: '2030-01-01T00:00:00.000Z',
      },
      { userId: 12, role: 'seller' },
    );

    expect(voucherRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'SAVE10',
        shop_id: 'owned-shop',
      }),
    );
    expect(shopRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user: { id: '12' } } }),
    );
  });

  it('does not expose another seller shop voucher', async () => {
    const voucherRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'voucher-1',
        shop_id: 'other-shop',
      }),
    };
    const shopRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'owned-shop' }),
    };
    const service = new VoucherService(
      voucherRepo as unknown as Repository<Voucher>,
      shopRepo as unknown as Repository<Shop>,
      {} as Repository<VoucherRedemption>,
    );

    await expect(
      service.findOne('voucher-1', { userId: 12, role: 'seller' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects deleting a voucher with existing redemptions', async () => {
    const voucherRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'voucher-1',
        shop_id: null,
        usage_count: 0,
      }),
      delete: jest.fn(),
    };
    const redemptionRepo = { count: jest.fn().mockResolvedValue(1) };
    const service = new VoucherService(
      voucherRepo as unknown as Repository<Voucher>,
      {} as Repository<Shop>,
      redemptionRepo as unknown as Repository<VoucherRedemption>,
    );

    await expect(
      service.remove('voucher-1', { userId: 1, role: 'admin' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(voucherRepo.delete).not.toHaveBeenCalled();
  });
});
