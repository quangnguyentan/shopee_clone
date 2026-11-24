import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  it('can be constructed with the payment service', () => {
    const controller = new PaymentController({} as PaymentService);
    expect(controller).toBeDefined();
  });
});
