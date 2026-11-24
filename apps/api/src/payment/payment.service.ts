import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import {
  DataSource,
  EntityManager,
  In,
  LessThan,
  Repository,
} from 'typeorm';
import {
  InventoryReservationStatus,
  OrderPaymentStatus,
  OrderStatus,
  PaymentStatus,
  ShopOrderStatus,
} from '@/common/enums/marketplace.enums';
import { InventoryReservation } from '@/inventory-reservation/entities/inventory-reservation.entity';
import { Order } from '@/order/entities/order.entity';
import { CheckoutPaymentMethod } from '@/order/dto/create-order.dto';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { Payment } from './entities/payment.entity';

type PaymentResultStatus = 'success' | 'failed';

export interface CheckoutPaymentResult {
  method: CheckoutPaymentMethod;
  status: PaymentStatus;
  redirect_url?: string;
  qr_url?: string;
  bank_account?: {
    bank_id: string;
    account_number: string;
    account_name: string;
  };
  expires_at?: string;
  message?: string;
}

export interface PaymentMethodOption {
  id: CheckoutPaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}

interface MomoCreateResponse {
  resultCode: number;
  message?: string;
  payUrl?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) { }

  getAvailableMethods(): PaymentMethodOption[] {
    const hasVnpayCredentials = Boolean(
      this.config.get<string>('VNPAY_TMN_CODE') &&
      this.config.get<string>('VNPAY_HASH_SECRET'),
    );
    console.log(hasVnpayCredentials, "hasVnpayCredentials")
    const hasMomoCredentials = Boolean(
      this.config.get<string>('MOMO_PARTNER_CODE') &&
      this.config.get<string>('MOMO_ACCESS_KEY') &&
      this.config.get<string>('MOMO_SECRET_KEY'),
    );
    const hasVietQrAccount = Boolean(
      this.config.get<string>('VIETQR_BANK_ID') &&
      this.config.get<string>('VIETQR_ACCOUNT_NUMBER') &&
      this.config.get<string>('VIETQR_ACCOUNT_NAME'),
    );

    return [
      {
        id: 'vnpay',
        label: 'VNPay (Sandbox)',
        description: 'Thanh toán thử nghiệm qua cổng VNPay.',
        enabled: hasVnpayCredentials,
      },
      {
        id: 'momo',
        label: 'MoMo (Sandbox)',
        description: 'Thanh toán thử nghiệm qua ví MoMo.',
        enabled: hasMomoCredentials,
      },
      {
        id: 'vietqr_manual',
        label: 'Chuyển khoản VietQR',
        description: 'Quét mã và chờ shop xác nhận chuyển khoản.',
        enabled: hasVietQrAccount,
      },
      {
        id: 'cod',
        label: 'Thanh toán khi nhận hàng (COD)',
        description: 'Thanh toán trực tiếp khi nhận đơn hàng.',
        enabled: true,
      },
    ];
  }

  isMethodAvailable(method: CheckoutPaymentMethod) {
    return this.getAvailableMethods().some(
      (option) => option.id === method && option.enabled,
    );
  }

  async initializeCheckoutPayment(
    order: Order,
    method: CheckoutPaymentMethod,
    clientIp: string,
  ): Promise<CheckoutPaymentResult> {
    if (!this.isMethodAvailable(method)) {
      throw new ServiceUnavailableException(
        `Payment method "${method}" is not configured`,
      );
    }

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        order_id: order.id,
        method,
        provider: method,
        status: PaymentStatus.PENDING,
        amount: order.total_amount,
        currency: order.currency,
        idempotency_key: randomUUID(),
      }),
    );

    return this.createCheckoutPaymentResult(order, payment, method, clientIp);
  }

  async retryPendingOrderPayment(
    orderId: string,
    buyerId: number,
    clientIp: string,
  ): Promise<CheckoutPaymentResult> {
    const { order, payment } = await this.dataSource.transaction(
      async (manager) => {
        const order = await manager.findOne(Order, {
          where: { id: orderId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!order || String(order.buyer_id) !== String(buyerId)) {
          throw new NotFoundException('Order not found');
        }
        if (
          order.status !== OrderStatus.PENDING_PAYMENT ||
          order.payment_status !== OrderPaymentStatus.PENDING
        ) {
          throw new ConflictException('Order is no longer awaiting payment');
        }

        const payment = await manager.findOne(Payment, {
          where: { order_id: order.id, status: PaymentStatus.PENDING },
          order: { created_at: 'DESC' },
          lock: { mode: 'pessimistic_write' },
        });
        if (!payment) {
          throw new ConflictException('No pending payment session found');
        }

        return { order, payment };
      },
    );

    const method = payment.method;
    if (
      method !== 'vnpay' &&
      method !== 'momo' &&
      method !== 'vietqr_manual'
    ) {
      throw new ConflictException('This payment method cannot be retried');
    }
    if (this.getPaymentExpiration(payment).getTime() <= Date.now()) {
      throw new ConflictException('Payment session has expired');
    }
    if (!this.isMethodAvailable(method)) {
      throw new ServiceUnavailableException(
        `Payment method "${method}" is not configured`,
      );
    }

    return this.createCheckoutPaymentResult(order, payment, method, clientIp);
  }

  private async createCheckoutPaymentResult(
    order: Order,
    payment: Payment,
    method: CheckoutPaymentMethod,
    clientIp: string,
  ): Promise<CheckoutPaymentResult> {
    if (method === 'cod') {
      return {
        method,
        status: payment.status,
        message: 'Thanh toán khi nhận hàng.',
      };
    }
    if (method === 'vietqr_manual') {
      return this.createVietQrPayment(order, payment);
    }
    if (method === 'vnpay') {
      return this.createVnpayPayment(order, payment, clientIp);
    }
    return this.createMomoPayment(order, payment);
  }

  private getPaymentExpiration(payment: Payment) {
    const createdAt = payment.created_at
      ? new Date(payment.created_at)
      : new Date();
    return new Date(createdAt.getTime() + 20 * 60 * 1000);
  }

  async handleVnpayReturn(params: Record<string, string>) {
    const result = await this.processVnpayCallback(params);
    return this.getResultRedirect(result.orderNo, result.status);
  }

  async handleVnpayIpn(params: Record<string, string>) {
    await this.processVnpayCallback(params);
    return { RspCode: '00', Message: 'Confirm Success' };
  }

  async handleMomoReturn(params: Record<string, string>) {
    const result = await this.processMomoCallback(params);
    return this.getResultRedirect(result.orderNo, result.status);
  }

  async handleMomoIpn(params: Record<string, string>) {
    await this.processMomoCallback(params);
    return { resultCode: 0, message: 'Success' };
  }

  async confirmManualTransfer(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });
    if (!payment || payment.method !== 'vietqr_manual') {
      throw new NotFoundException('Manual transfer payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException('Payment is no longer pending');
    }

    return this.settleOrder(
      payment.order.order_no,
      'vietqr_manual',
      true,
      `manual-${payment.id}`,
    );
  }

  async failPendingOrder(orderId: string, reason: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException('Order not found');
      return this.failOrder(manager, order, reason);
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expirePendingPayments() {
    const expirationCutoff = new Date(Date.now() - 20 * 60 * 1000);
    const expiredPayments = await this.paymentRepo.find({
      where: {
        method: In(['vnpay', 'momo', 'vietqr_manual']),
        status: PaymentStatus.PENDING,
        created_at: LessThan(expirationCutoff),
      },
      take: 100,
      order: { created_at: 'ASC' },
    });

    for (const payment of expiredPayments) {
      await this.failPendingOrder(payment.order_id, 'Payment session expired');
    }
  }

  private async createVietQrPayment(
    order: Order,
    payment: Payment,
  ): Promise<CheckoutPaymentResult> {
    const bankId = this.requiredConfig('VIETQR_BANK_ID');
    const accountNumber = this.requiredConfig('VIETQR_ACCOUNT_NUMBER');
    const accountName = this.requiredConfig('VIETQR_ACCOUNT_NAME');
    const amount = this.toVndAmount(payment.amount);
    const qrUrl = new URL(
      `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(accountNumber)}-compact2.png`,
    );
    qrUrl.searchParams.set('amount', String(amount));
    qrUrl.searchParams.set('addInfo', order.order_no);
    qrUrl.searchParams.set('accountName', accountName);

    return {
      method: 'vietqr_manual',
      status: payment.status,
      qr_url: qrUrl.toString(),
      bank_account: {
        bank_id: bankId,
        account_number: accountNumber,
        account_name: accountName,
      },
      expires_at: this.getPaymentExpiration(payment).toISOString(),
      message: 'Chuyển đúng số tiền và chờ xác nhận thủ công.',
    };
  }

  private async createVnpayPayment(
    order: Order,
    payment: Payment,
    clientIp: string,
  ): Promise<CheckoutPaymentResult> {
    const tmnCode = this.requiredConfig('VNPAY_TMN_CODE');
    const hashSecret = this.requiredConfig('VNPAY_HASH_SECRET');
    const apiBase = this.getApiBaseUrl();
    const parameters: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(this.toVndAmount(payment.amount) * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.order_no,
      vnp_OrderInfo: `Thanh toan don hang ${order.order_no}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl:
        this.config.get<string>('VNPAY_RETURN_URL') ??
        `${apiBase}/payment/vnpay/return`,
      vnp_IpAddr: clientIp === '::1' ? '127.0.0.1' : clientIp,
      vnp_CreateDate: this.getVietnamDateTime(),
    };
    const signature = this.hmac('sha512', hashSecret, this.vnpaySignData(parameters));
    const paymentUrl = new URL(
      this.config.get<string>('VNPAY_PAYMENT_URL') ??
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    for (const [key, value] of Object.entries(parameters)) {
      paymentUrl.searchParams.set(key, value);
    }
    paymentUrl.searchParams.set('vnp_SecureHash', signature);

    return {
      method: 'vnpay',
      status: payment.status,
      redirect_url: paymentUrl.toString(),
      expires_at: this.getPaymentExpiration(payment).toISOString(),
    };
  }

  private async createMomoPayment(
    order: Order,
    payment: Payment,
  ): Promise<CheckoutPaymentResult> {
    const partnerCode = this.requiredConfig('MOMO_PARTNER_CODE');
    const accessKey = this.requiredConfig('MOMO_ACCESS_KEY');
    const secretKey = this.requiredConfig('MOMO_SECRET_KEY');
    const apiBase = this.getApiBaseUrl();
    const requestId = randomUUID();
    const amount = this.toVndAmount(payment.amount);
    const orderInfo = `Thanh toan don hang ${order.order_no}`;
    const extraData = '';
    const requestType = 'captureWallet';
    const redirectUrl =
      this.config.get<string>('MOMO_REDIRECT_URL') ??
      `${apiBase}/payment/momo/return`;
    const ipnUrl =
      this.config.get<string>('MOMO_IPN_URL') ??
      `${apiBase}/payment/momo/ipn`;
    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${order.order_no}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${partnerCode}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join('&');
    const signature = this.hmac('sha256', secretKey, rawSignature);
    const endpoint =
      this.config.get<string>('MOMO_PAYMENT_URL') ??
      'https://test-payment.momo.vn/v2/gateway/api/create';

    let response: MomoCreateResponse;
    try {
      const result = await axios.post<MomoCreateResponse>(
        endpoint,
        {
          partnerCode,
          requestId,
          amount,
          orderId: order.order_no,
          orderInfo,
          redirectUrl,
          ipnUrl,
          requestType,
          extraData,
          lang: 'vi',
          signature,
        },
        { timeout: 10000 },
      );
      response = result.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.warn(`MoMo sandbox request failed: ${error.message}`);
        throw new ServiceUnavailableException(
          'MoMo sandbox could not create a payment session',
        );
      }
      throw error;
    }

    if (response.resultCode !== 0 || !response.payUrl) {
      throw new ServiceUnavailableException(
        response.message ?? 'MoMo sandbox rejected the payment request',
      );
    }

    return {
      method: 'momo',
      status: payment.status,
      redirect_url: response.payUrl,
      expires_at: this.getPaymentExpiration(payment).toISOString(),
    };
  }

  private async processVnpayCallback(params: Record<string, string>) {
    const hashSecret = this.requiredConfig('VNPAY_HASH_SECRET');
    const secureHash = params.vnp_SecureHash;
    const unsignedParams = { ...params };
    delete unsignedParams.vnp_SecureHash;
    delete unsignedParams.vnp_SecureHashType;

    if (
      params.vnp_TmnCode !== this.requiredConfig('VNPAY_TMN_CODE') ||
      !this.isValidSignature(
        secureHash,
        this.hmac('sha512', hashSecret, this.vnpaySignData(unsignedParams)),
      )
    ) {
      throw new BadRequestException('Invalid VNPay callback signature');
    }

    const orderNo = params.vnp_TxnRef;
    if (!orderNo) throw new BadRequestException('Missing VNPay order number');
    const payment = await this.findPendingPayment(orderNo, 'vnpay');
    if (this.toVndAmount(payment.amount) * 100 !== Number(params.vnp_Amount)) {
      throw new BadRequestException('VNPay callback amount does not match');
    }

    const isSuccess =
      params.vnp_ResponseCode === '00' &&
      params.vnp_TransactionStatus === '00';
    const status = isSuccess
      ? await this.settleOrder(
        orderNo,
        'vnpay',
        true,
        params.vnp_TransactionNo,
      )
      : await this.settleOrder(
        orderNo,
        'vnpay',
        false,
        params.vnp_TransactionNo,
        `VNPay response ${params.vnp_ResponseCode ?? 'unknown'}`,
      );
    return { orderNo, status };
  }

  private async processMomoCallback(params: Record<string, string>) {
    const accessKey = this.requiredConfig('MOMO_ACCESS_KEY');
    const secretKey = this.requiredConfig('MOMO_SECRET_KEY');
    const expectedSignature = this.hmac(
      'sha256',
      secretKey,
      this.momoCallbackSignData(params, accessKey),
    );
    if (!this.isValidSignature(params.signature, expectedSignature)) {
      throw new BadRequestException('Invalid MoMo callback signature');
    }

    const orderNo = params.orderId;
    if (!orderNo) throw new BadRequestException('Missing MoMo order number');
    const payment = await this.findPendingPayment(orderNo, 'momo');
    if (this.toVndAmount(payment.amount) !== Number(params.amount)) {
      throw new BadRequestException('MoMo callback amount does not match');
    }

    const isSuccess = Number(params.resultCode) === 0;
    const status = isSuccess
      ? await this.settleOrder(orderNo, 'momo', true, params.transId)
      : await this.settleOrder(
        orderNo,
        'momo',
        false,
        params.transId,
        `MoMo result ${params.resultCode ?? 'unknown'}`,
      );
    return { orderNo, status };
  }

  private async findPendingPayment(orderNo: string, provider: string) {
    const payment = await this.paymentRepo.findOne({
      where: { order: { order_no: orderNo }, provider },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (
      payment.status !== PaymentStatus.PENDING &&
      payment.status !== PaymentStatus.SUCCEEDED &&
      payment.status !== PaymentStatus.FAILED
    ) {
      throw new ConflictException('Payment is no longer pending');
    }
    return payment;
  }

  private async settleOrder(
    orderNo: string,
    provider: string,
    succeeded: boolean,
    transactionId?: string,
    failureReason?: string,
  ): Promise<PaymentResultStatus> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { order_no: orderNo },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException('Order not found');

      const payment = await manager.findOne(Payment, {
        where: { order_id: order.id, provider },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status === PaymentStatus.SUCCEEDED) return 'success';
      if (payment.status !== PaymentStatus.PENDING) return 'failed';

      if (!succeeded) {
        await this.failOrder(
          manager,
          order,
          failureReason ?? 'Payment failed',
          payment,
          transactionId,
        );
        return 'failed';
      }

      payment.status = PaymentStatus.SUCCEEDED;
      payment.provider_transaction_id = transactionId ?? null;
      payment.paid_at = new Date();
      order.payment_status = OrderPaymentStatus.PAID;
      order.status = OrderStatus.PAID;
      await manager.save(payment);
      await manager.save(order);
      await manager.update(
        ShopOrder,
        { order_id: order.id },
        { status: ShopOrderStatus.PAID },
      );

      const reservations = await manager.find(InventoryReservation, {
        where: {
          order_id: order.id,
          status: InventoryReservationStatus.HOLDING,
        },
      });
      for (const reservation of reservations) {
        reservation.status = InventoryReservationStatus.CONFIRMED;
        await manager.save(reservation);
      }
      return 'success';
    });
  }

  private async failOrder(
    manager: EntityManager,
    order: Order,
    reason: string,
    payment?: Payment,
    transactionId?: string,
  ) {
    if (order.payment_status === OrderPaymentStatus.PAID) return 'success';

    const currentPayment =
      payment ??
      (await manager.findOne(Payment, {
        where: { order_id: order.id, status: PaymentStatus.PENDING },
        lock: { mode: 'pessimistic_write' },
      }));
    if (currentPayment) {
      currentPayment.status = PaymentStatus.FAILED;
      currentPayment.provider_transaction_id = transactionId ?? null;
      currentPayment.failure_reason = reason;
      await manager.save(currentPayment);
    }

    order.payment_status = OrderPaymentStatus.FAILED;
    order.status = OrderStatus.CANCELLED;
    order.cancelled_at = new Date();
    order.cancelled_reason = reason;
    await manager.save(order);
    await manager.update(
      ShopOrder,
      { order_id: order.id },
      { status: ShopOrderStatus.CANCELLED },
    );

    const reservations = await manager.find(InventoryReservation, {
      where: {
        order_id: order.id,
        status: InventoryReservationStatus.HOLDING,
      },
    });
    for (const reservation of reservations) {
      await manager.increment(
        ProductVariant,
        { id: reservation.product_variant_id },
        'stock',
        reservation.quantity,
      );
      reservation.status = InventoryReservationStatus.RELEASED;
      await manager.save(reservation);
    }
    return 'failed';
  }

  private vnpaySignData(parameters: Record<string, string>) {
    return Object.keys(parameters)
      .sort()
      .map((key) => {
        const encodedValue = encodeURIComponent(parameters[key]).replace(/%20/g, '+');
        return `${key}=${encodedValue}`;
      })
      .join('&');
  }

  private momoCallbackSignData(
    params: Record<string, string>,
    accessKey: string,
  ) {
    return [
      `accessKey=${accessKey}`,
      `amount=${params.amount ?? ''}`,
      `extraData=${params.extraData ?? ''}`,
      `message=${params.message ?? ''}`,
      `orderId=${params.orderId ?? ''}`,
      `orderInfo=${params.orderInfo ?? ''}`,
      `orderType=${params.orderType ?? ''}`,
      `partnerCode=${params.partnerCode ?? ''}`,
      `payType=${params.payType ?? ''}`,
      `requestId=${params.requestId ?? ''}`,
      `responseTime=${params.responseTime ?? ''}`,
      `resultCode=${params.resultCode ?? ''}`,
      `transId=${params.transId ?? ''}`,
    ].join('&');
  }

  private hmac(algorithm: 'sha256' | 'sha512', secret: string, value: string) {
    return createHmac(algorithm, secret).update(value, 'utf8').digest('hex');
  }

  private isValidSignature(received: string | undefined, expected: string) {
    if (!received || !/^[a-f0-9]+$/i.test(received)) return false;
    const actualBuffer = Buffer.from(received, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  }

  private toVndAmount(value: string) {
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount < 0) {
      throw new BadRequestException('Payment amount must be a whole VND value');
    }
    return amount;
  }

  private getVietnamDateTime() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );
    return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
  }

  private requiredConfig(key: string) {
    const value = this.config.get<string>(key)?.trim();
    if (!value) {
      throw new ServiceUnavailableException(
        `Payment configuration "${key}" is required`,
      );
    }
    return value;
  }

  private getApiBaseUrl() {
    return (
      this.config.get<string>('PAYMENT_API_PUBLIC_URL') ??
      'http://localhost:8080'
    ).replace(/\/+$/, '');
  }

  private getResultRedirect(orderNo: string, status: PaymentResultStatus) {
    const frontendUrl = this.config.get<string>('BUYER_ENV') ?? 'http://localhost:3000';
    const redirect = new URL('/payment/result', frontendUrl);
    redirect.searchParams.set('order_no', orderNo);
    redirect.searchParams.set('status', status);
    return redirect.toString();
  }
}
