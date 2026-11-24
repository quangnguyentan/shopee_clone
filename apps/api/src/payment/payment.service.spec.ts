import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import {
  OrderPaymentStatus,
  OrderStatus,
  PaymentStatus,
} from '@/common/enums/marketplace.enums';

describe('PaymentService', () => {
  let paymentRepo: {
    create: jest.Mock;
    save: jest.Mock;
  };
  const dataSource = { transaction: jest.fn() };
  const configValues: Record<string, string> = {};
  const config = {
    get: jest.fn((key: string) => configValues[key]),
  };
  let service: PaymentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    paymentRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(),
    };
    Object.keys(configValues).forEach((key) => delete configValues[key]);
    service = new PaymentService(
      paymentRepo as unknown as Repository<Payment>,
      dataSource as DataSource,
      config as unknown as ConfigService,
    );
  });

  it('enables COD by default and enables online methods only with credentials', () => {
    expect(service.getAvailableMethods()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'cod', enabled: true }),
        expect.objectContaining({ id: 'vnpay', enabled: false }),
        expect.objectContaining({ id: 'momo', enabled: false }),
        expect.objectContaining({ id: 'vietqr_manual', enabled: false }),
      ]),
    );

    configValues.VNPAY_TMN_CODE = 'sandbox-code';
    configValues.VNPAY_HASH_SECRET = 'sandbox-secret';
    configValues.MOMO_PARTNER_CODE = 'partner';
    configValues.MOMO_ACCESS_KEY = 'access';
    configValues.MOMO_SECRET_KEY = 'secret';
    configValues.VIETQR_BANK_ID = 'bank';
    configValues.VIETQR_ACCOUNT_NUMBER = 'account';
    configValues.VIETQR_ACCOUNT_NAME = 'shop';

    const methods = service.getAvailableMethods();
    expect(methods.find((method) => method.id === 'vnpay')?.enabled).toBe(true);
    expect(methods.find((method) => method.id === 'momo')?.enabled).toBe(true);
    expect(
      methods.find((method) => method.id === 'vietqr_manual')?.enabled,
    ).toBe(true);
  });

  it('creates a pending COD payment without contacting a gateway', async () => {
    paymentRepo.save.mockImplementation((payment) =>
      Promise.resolve({ ...payment, id: 'payment-1' }),
    );
    const order = {
      id: 'order-1',
      order_no: 'ORD-1',
      total_amount: '125000.00',
      currency: 'VND',
    } as unknown as Payment['order'];

    await expect(
      service.initializeCheckoutPayment(order, 'cod', '127.0.0.1'),
    ).resolves.toEqual({
      method: 'cod',
      status: PaymentStatus.PENDING,
      message: 'Thanh toán khi nhận hàng.',
    });
    expect(paymentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: order.id,
        method: 'cod',
        status: PaymentStatus.PENDING,
        amount: order.total_amount,
      }),
    );
  });

  it('reuses the buyer-owned pending payment session when retrying payment', async () => {
    configValues.VIETQR_BANK_ID = 'VCB';
    configValues.VIETQR_ACCOUNT_NUMBER = '123456789';
    configValues.VIETQR_ACCOUNT_NAME = 'SHOP';

    const order = {
      id: 'order-1',
      buyer_id: '9',
      order_no: 'ORD-1',
      status: OrderStatus.PENDING_PAYMENT,
      payment_status: OrderPaymentStatus.PENDING,
      total_amount: '125000.00',
      currency: 'VND',
    };
    const payment = {
      id: 'payment-1',
      order_id: order.id,
      method: 'vietqr_manual',
      status: PaymentStatus.PENDING,
      amount: order.total_amount,
      created_at: new Date(),
    };
    const manager = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(payment),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    const result = await service.retryPendingOrderPayment(
      order.id,
      9,
      '127.0.0.1',
    );

    expect(result.method).toBe('vietqr_manual');
    expect(result.qr_url).toContain('VCB-123456789');
    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('does not disclose or retry an order owned by another buyer', async () => {
    const manager = {
      findOne: jest.fn().mockResolvedValueOnce({
        id: 'order-1',
        buyer_id: '10',
      }),
    };
    dataSource.transaction.mockImplementation((work) => work(manager));

    await expect(
      service.retryPendingOrderPayment('order-1', 9, '127.0.0.1'),
    ).rejects.toMatchObject({ status: 404 });
    expect(manager.findOne).toHaveBeenCalledTimes(1);
  });
});
