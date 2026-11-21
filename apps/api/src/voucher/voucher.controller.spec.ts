import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';

describe('VoucherController', () => {
  it('uses the service', () => {
    const service = {} as VoucherService;
    expect(new VoucherController(service)).toBeDefined();
  });
});
