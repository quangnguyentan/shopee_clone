import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import {
  InventoryReservationStatus,
  OrderPaymentStatus,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  ShopOrderShippingStatus,
  ShopOrderStatus,
} from '@/common/enums/marketplace.enums';
import { Cart } from '@/cart/entities/cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { InventoryReservation } from '@/inventory-reservation/entities/inventory-reservation.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Shop } from '@/shop/entities/shop.entity';
import { OrderStatusHistory } from '@/order-status-history/entities/order-status-history.entity';
import { ProductVariantAttribute } from '@/product-variant-attributes/entities/product-variant-attribute.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { Product } from '@/product/entities/product.entity';
import { PaymentService } from '@/payment/payment.service';
import { Payment } from '@/payment/entities/payment.entity';
import { Order } from './entities/order.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { Shipping } from '@/shipping/entities/shipping.entity';
import { PaginationDto } from '@/base/base.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { BuyerOrdersQueryDto } from './dto/buyer-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateSellerOrderStatusDto } from './dto/update-seller-order-status.dto';

type OrderManager = { userId: number; role: 'admin' | 'seller' };

interface CheckoutLine {
  variant: ProductVariant;
  product: Product;
  quantity: number;
  variantLabel: string | null;
  imageUrl: string | null;
}

const toMinorUnits = (amount: number | string) => {
  const numericAmount = Number(amount);
  const minorUnits = Math.round(numericAmount * 100);
  if (
    !Number.isFinite(numericAmount) ||
    numericAmount < 0 ||
    !Number.isSafeInteger(numericAmount) ||
    !Number.isSafeInteger(minorUnits)
  ) {
    throw new BadRequestException('VND amounts must be non-negative whole numbers');
  }
  return minorUnits;
};

const fromMinorUnits = (amount: number) => (amount / 100).toFixed(2);

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ShopOrder)
    private readonly shopOrderRepo: Repository<ShopOrder>,
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,
    private readonly config: ConfigService,
  ) {}

  async create(
    buyerId: number,
    dto: CreateOrderDto,
    clientIp = '127.0.0.1',
  ) {
    if (!this.paymentService.isMethodAvailable(dto.payment_method)) {
      throw new ServiceUnavailableException(
        `Payment method "${dto.payment_method}" is not configured`,
      );
    }

    const shippingFeePerShop = Number(
      this.config.get<string>('CHECKOUT_SHIPPING_FEE') ?? 0,
    );
    if (
      !Number.isSafeInteger(shippingFeePerShop) ||
      shippingFeePerShop < 0
    ) {
      throw new ServiceUnavailableException(
        'CHECKOUT_SHIPPING_FEE must be a non-negative number',
      );
    }

    const created = await this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { user: { id: String(buyerId) } },
        lock: { mode: 'pessimistic_write' },
      });
      if (!cart) throw new ConflictException('Cart is empty');

      const allCartItems = await manager.find(CartItem, {
        where: { cart: { id: cart.id } },
        relations: ['product_variant'],
      });
      if (allCartItems.length === 0) {
        throw new ConflictException('Cart is empty');
      }
      const cartItems = dto.selected_item_ids
        ? allCartItems.filter((item) =>
            dto.selected_item_ids!.includes(String(item.id)),
          )
        : allCartItems;
      if (
        cartItems.length === 0 ||
        (dto.selected_item_ids &&
          cartItems.length !== new Set(dto.selected_item_ids).size)
      ) {
        throw new BadRequestException(
          'One or more selected cart items are invalid',
        );
      }

      const lines: CheckoutLine[] = [];
      for (const item of cartItems) {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: String(item.product_variant.id) },
          lock: { mode: 'pessimistic_write' },
        });
        if (!variant) {
          throw new NotFoundException('A product variant in the cart no longer exists');
        }

        const product = await manager.findOne(Product, {
          where: { id: variant.product_id },
          relations: ['shop', 'images'],
        });
        if (
          !product ||
          product.status !== 'active' ||
          !product.shop ||
          product.shop.status !== 'active'
        ) {
          throw new ConflictException(
            `Product "${product?.name ?? variant.sku}" is no longer available`,
          );
        }
        if (variant.stock < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for product "${product.name}"`,
          );
        }

        const attributes = await manager.find(ProductVariantAttribute, {
          where: { variant_id: variant.id },
          relations: ['attribute', 'value'],
        });
        variant.stock -= item.quantity;
        await manager.save(ProductVariant, variant);

        const primaryImage =
          product.images?.find((image) => image.is_primary) ??
          product.images?.[0];
        lines.push({
          variant,
          product,
          quantity: item.quantity,
          variantLabel:
            attributes
              .map(
                (attribute) =>
                  `${attribute.attribute?.name ?? ''}: ${attribute.value?.value ?? attribute.custom_value ?? ''}`,
              )
              .filter((value) => !value.endsWith(': '))
              .join(' / ') || null,
          imageUrl: primaryImage?.url ?? null,
        });
      }

      const itemsSubtotal = lines.reduce(
        (total, line) =>
          total + toMinorUnits(line.variant.price) * line.quantity,
        0,
      );
      if (!Number.isSafeInteger(itemsSubtotal)) {
        throw new BadRequestException('Order total exceeds the supported amount');
      }

      const linesByShop = new Map<string, CheckoutLine[]>();
      for (const line of lines) {
        const shopId = String(line.product.shop_id);
        const shopLines = linesByShop.get(shopId) ?? [];
        shopLines.push(line);
        linesByShop.set(shopId, shopLines);
      }

      const shippingFee = toMinorUnits(shippingFeePerShop) * linesByShop.size;
      const totalAmount = itemsSubtotal + shippingFee;
      if (!Number.isSafeInteger(totalAmount)) {
        throw new BadRequestException('Order total exceeds the supported amount');
      }

      const isCod = dto.payment_method === 'cod';
      const initialStatus = isCod
        ? OrderStatus.PROCESSING
        : OrderStatus.PENDING_PAYMENT;
      const order = await manager.save(
        Order,
        manager.create(Order, {
          buyer_id: String(buyerId),
          order_no: `ORD-${randomUUID()}`,
          shipping_address: { ...dto.shipping_address },
          subtotal: fromMinorUnits(itemsSubtotal),
          shipping_fee: fromMinorUnits(shippingFee),
          discount_amount: '0.00',
          total_amount: fromMinorUnits(totalAmount),
          currency: 'VND',
          status: initialStatus,
          payment_status: OrderPaymentStatus.PENDING,
        }),
      );

      await manager.save(
        OrderStatusHistory,
        manager.create(OrderStatusHistory, {
          order_id: order.id,
          actor_user_id: String(buyerId),
          from_status: null,
          to_status: initialStatus,
          reason: 'Buyer checkout',
        }),
      );

      const shopOrders: Array<ShopOrder & { items: OrderItem[] }> = [];
      const reservations: InventoryReservation[] = [];
      for (const [shopId, shopLines] of linesByShop) {
        const shopOrderStatus = isCod
          ? ShopOrderStatus.PROCESSING
          : ShopOrderStatus.PENDING_PAYMENT;
        const shopOrder = await manager.save(
          ShopOrder,
          manager.create(ShopOrder, {
            order_id: order.id,
            shop_id: shopId,
            shop_order_no: `SO-${randomUUID()}`,
            subtotal: fromMinorUnits(
              shopLines.reduce(
                (total, line) =>
                  total + toMinorUnits(line.variant.price) * line.quantity,
                0,
              ),
            ),
            shipping_fee: fromMinorUnits(toMinorUnits(shippingFeePerShop)),
            discount_amount: '0.00',
            total_amount: fromMinorUnits(
              shopLines.reduce(
                (total, line) =>
                  total + toMinorUnits(line.variant.price) * line.quantity,
                toMinorUnits(shippingFeePerShop),
              ),
            ),
            currency: 'VND',
            status: shopOrderStatus,
            shipping_status: isCod
              ? ShopOrderShippingStatus.PREPARING
              : ShopOrderShippingStatus.UNFULFILLED,
          }),
        );

        const savedItems = await manager.save(
          OrderItem,
          shopLines.map((line) =>
            manager.create(OrderItem, {
              order_id: order.id,
              shop_order_id: shopOrder.id,
              shop_id: shopId,
              product_variant: line.variant,
              product_name: line.product.name,
              sku: line.variant.sku,
              variant_label: line.variantLabel,
              image_url: line.imageUrl,
              price: fromMinorUnits(toMinorUnits(line.variant.price)),
              quantity: line.quantity,
            }),
          ),
        );
        shopOrders.push({ ...shopOrder, items: savedItems });

        for (const line of shopLines) {
          reservations.push(
            manager.create(InventoryReservation, {
              reservation_key: randomUUID(),
              order_id: order.id,
              product_variant_id: line.variant.id,
              quantity: line.quantity,
              status: InventoryReservationStatus.HOLDING,
              expires_at: isCod
                ? new Date('9999-12-31T23:59:59.999Z')
                : new Date(Date.now() + 20 * 60 * 1000),
            }),
          );
        }
      }
      await manager.save(InventoryReservation, reservations);

      return {
        order: {
          id: order.id,
          order_no: order.order_no,
          subtotal: order.subtotal,
          shipping_fee: order.shipping_fee,
          discount_amount: order.discount_amount,
          total_amount: order.total_amount,
          currency: order.currency,
          status: order.status,
          payment_status: order.payment_status,
          shop_orders: shopOrders,
        },
        entity: order,
        cartId: cart.id,
        cartItemIds: cartItems.map((item) => item.id),
      };
    });

    try {
      const payment = await this.paymentService.initializeCheckoutPayment(
        created.entity,
        dto.payment_method,
        clientIp.replace(/^::ffff:/, ''),
      );
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(CartItem, {
          cart: { id: created.cartId },
          id: In(created.cartItemIds),
        });
      });
      return { order: created.order, payment };
    } catch (error) {
      await this.paymentService.failPendingOrder(
        created.entity.id,
        'Unable to initialize the payment session',
      );
      throw error;
    }
  }

  async findAll(user: OrderManager, query: PaginationDto) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 100);
    const skip = (page - 1) * limit;

    if (user.role === 'admin') {
      const [orders, total] = await this.orderRepo.findAndCount({
        relations: [
          'buyer',
          'items',
          'shop_orders',
          'shop_orders.shop',
          'shop_orders.items',
          'shop_orders.shippings',
          'status_history',
        ],
        order: { created_at: 'DESC' },
        take: limit,
        skip,
      });
      return {
        items: orders.map((order) => this.toAdminOrder(order)),
        total,
        page,
        limit,
      };
    }

    const shop = await this.findSellerShop(user.userId);
    if (!shop) return { items: [], total: 0, page, limit };

    const [shopOrders, total] = await this.shopOrderRepo.findAndCount({
      where: { shop_id: shop.id },
      relations: [
        'order',
        'order.buyer',
        'items',
        'status_history',
        'shippings',
      ],
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    return {
      items: shopOrders.map((shopOrder) => this.toSellerOrder(shopOrder)),
      total,
      page,
      limit,
    };
  }

  async findMine(buyerId: number, query: BuyerOrdersQueryDto) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 10, 100);
    const [orders, total] = await this.orderRepo.findAndCount({
      where: {
        buyer_id: String(buyerId),
        ...(query.status ? { status: query.status } : {}),
      },
      relations: [
        'shop_orders',
        'shop_orders.shop',
        'shop_orders.items',
        'shop_orders.items.product_variant',
        'shop_orders.shippings',
      ],
      order: { created_at: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      items: orders.map((order) => ({
        id: order.id,
        order_no: order.order_no,
        subtotal: order.subtotal,
        shipping_fee: order.shipping_fee,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        currency: order.currency,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        shop_orders: (order.shop_orders ?? []).map((shopOrder) => ({
          id: shopOrder.id,
          shop_order_no: shopOrder.shop_order_no,
          shop_id: shopOrder.shop_id,
          shop_name: shopOrder.shop?.name ?? 'Cửa hàng',
          subtotal: shopOrder.subtotal,
          shipping_fee: shopOrder.shipping_fee,
          total_amount: shopOrder.total_amount,
          status: shopOrder.status,
          shipping_status: shopOrder.shipping_status,
          shippings: (shopOrder.shippings ?? []).map((shipping) => ({
            id: shipping.id,
            carrier: shipping.carrier,
            tracking_number: shipping.tracking_number,
            status: shipping.status,
            shipped_at: shipping.shipped_at,
            delivered_at: shipping.delivered_at,
          })),
          items: (shopOrder.items ?? []).map((item) =>
            this.toSafeItem(item),
          ),
        })),
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: OrderManager) {
    if (user.role === 'admin') {
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: [
          'buyer',
          'items',
          'shop_orders',
          'shop_orders.shop',
          'shop_orders.items',
          'shop_orders.shippings',
          'status_history',
        ],
      });
      if (!order) throw new NotFoundException('Order not found');
      return this.toAdminOrder(order);
    }

    const shop = await this.findSellerShop(user.userId);
    if (!shop) throw new NotFoundException('Order not found');
    const shopOrders = await this.shopOrderRepo.find({
      where: { order_id: id, shop_id: shop.id },
      relations: [
        'order',
        'order.buyer',
        'items',
        'status_history',
        'shippings',
      ],
    });
    if (shopOrders.length === 0) throw new NotFoundException('Order not found');

    return {
      id,
      order_no: shopOrders[0].order.order_no,
      created_at: shopOrders[0].order.created_at,
      buyer: this.toSafeBuyer(shopOrders[0].order.buyer),
      shop_orders: shopOrders.map((shopOrder) =>
        this.toSellerOrder(shopOrder),
      ),
    };
  }

  async updateAdminOrder(
    id: string,
    dto: UpdateOrderDto,
    actor: OrderManager,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id } });
      if (!order) throw new NotFoundException('Order not found');

      const previousStatus = order.status;
      if (
        dto.status === OrderStatus.CANCELLED &&
        (dto.payment_status ?? order.payment_status) ===
          OrderPaymentStatus.PAID
      ) {
        throw new ConflictException(
          'Paid orders cannot be cancelled without a refund workflow',
        );
      }
      if (dto.status !== undefined) {
        order.status = dto.status;
        if (dto.status === OrderStatus.CANCELLED) {
          order.cancelled_at = new Date();
          order.cancelled_reason = dto.cancelled_reason ?? null;
        }
      }
      if (dto.payment_status !== undefined) {
        order.payment_status = dto.payment_status;
      }

      await manager.save(order);
      if (dto.status && dto.status !== previousStatus) {
        await manager.save(
          manager.create(OrderStatusHistory, {
            order_id: order.id,
            actor_user_id: String(actor.userId),
            from_status: previousStatus,
            to_status: dto.status,
            reason: dto.cancelled_reason ?? null,
          }),
        );
      }
      if (
        dto.status === OrderStatus.CANCELLED &&
        previousStatus !== OrderStatus.CANCELLED &&
        order.payment_status !== OrderPaymentStatus.PAID
      ) {
        if (order.payment_status === OrderPaymentStatus.PENDING) {
          order.payment_status = OrderPaymentStatus.FAILED;
        }
        await manager.save(order);
        await manager.update(
          Payment,
          { order_id: order.id, status: PaymentStatus.PENDING },
          {
            status: PaymentStatus.CANCELLED,
            failure_reason: dto.cancelled_reason ?? 'Order cancelled by admin',
          },
        );
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
      }

      const updated = await manager.findOne(Order, {
        where: { id },
        relations: [
          'buyer',
          'items',
          'shop_orders',
          'shop_orders.shop',
          'shop_orders.items',
          'shop_orders.shippings',
          'status_history',
        ],
      });
      if (!updated) throw new NotFoundException('Order not found');
      return this.toAdminOrder(updated);
    });
  }

  async updateSellerOrderStatus(
    shopOrderId: string,
    dto: UpdateSellerOrderStatusDto,
    actor: OrderManager,
  ) {
    const shop = actor.role === 'seller'
      ? await this.findSellerShop(actor.userId)
      : null;
    if (actor.role === 'seller' && !shop) {
      throw new NotFoundException('Order not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const shopOrder = await manager.findOne(ShopOrder, {
        where: {
          id: shopOrderId,
          ...(shop ? { shop_id: shop.id } : {}),
        },
        relations: [
          'order',
          'order.buyer',
          'items',
          'items.product_variant',
          'status_history',
          'shippings',
        ],
      });
      if (!shopOrder) throw new NotFoundException('Order not found');

      const nextStatus: Partial<Record<ShopOrderStatus, ShopOrderStatus>> = {
        [ShopOrderStatus.PAID]: ShopOrderStatus.PROCESSING,
        [ShopOrderStatus.PROCESSING]: ShopOrderStatus.SHIPPED,
      };
      if (nextStatus[shopOrder.status] !== dto.status) {
        throw new ConflictException(
          `Cannot move this order from ${shopOrder.status} to ${dto.status}`,
        );
      }

      const previousStatus = shopOrder.status;
      shopOrder.status = dto.status;
      if (dto.status === ShopOrderStatus.PROCESSING) {
        shopOrder.shipping_status = ShopOrderShippingStatus.PREPARING;
      } else if (dto.status === ShopOrderStatus.SHIPPED) {
        shopOrder.shipping_status = ShopOrderShippingStatus.SHIPPED;
        const shipping = manager.create(Shipping, {
          shop_order_id: shopOrder.id,
          address_snapshot: shopOrder.order?.shipping_address ?? null,
          shipping_fee: shopOrder.shipping_fee,
          status: ShipmentStatus.SHIPPED,
          carrier: dto.carrier?.trim() || null,
          tracking_number: dto.tracking_number?.trim() || null,
          shipped_at: new Date(),
        });
        await manager.save(shipping);
        shopOrder.shippings = [...(shopOrder.shippings ?? []), shipping];
      } else if (dto.status === ShopOrderStatus.COMPLETED) {
        shopOrder.shipping_status = ShopOrderShippingStatus.DELIVERED;
      }

      await manager.save(shopOrder);
      if (dto.status === ShopOrderStatus.SHIPPED) {
        const variantIds = new Set(
          shopOrder.items.map((item) => item.product_variant.id),
        );
        const reservations = await manager.find(InventoryReservation, {
          where: {
            order_id: shopOrder.order_id,
            status: InventoryReservationStatus.HOLDING,
          },
        });
        for (const reservation of reservations) {
          if (variantIds.has(reservation.product_variant_id)) {
            reservation.status = InventoryReservationStatus.CONFIRMED;
            await manager.save(reservation);
          }
        }
      }
      await manager.save(
        manager.create(OrderStatusHistory, {
          order_id: shopOrder.order_id,
          shop_order_id: shopOrder.id,
          actor_user_id: String(actor.userId),
          from_status: previousStatus,
          to_status: dto.status,
        }),
      );
      await this.syncParentOrderStatus(
        manager,
        shopOrder.order_id,
        actor.userId,
      );

      return this.toSellerOrder(shopOrder);
    });
  }

  async completeMyShopOrder(shopOrderId: string, buyerId: number) {
    return this.dataSource.transaction(async (manager) => {
      const shopOrder = await manager.findOne(ShopOrder, {
        where: { id: shopOrderId },
        relations: ['order'],
      });
      if (
        !shopOrder ||
        shopOrder.order?.buyer_id !== String(buyerId)
      ) {
        throw new NotFoundException('Order not found');
      }
      if (shopOrder.status !== ShopOrderStatus.SHIPPED) {
        throw new ConflictException(
          'Only shipped orders can be confirmed as received',
        );
      }

      shopOrder.status = ShopOrderStatus.COMPLETED;
      shopOrder.shipping_status = ShopOrderShippingStatus.DELIVERED;
      const shipments = await manager.find(Shipping, {
        where: { shop_order_id: shopOrder.id },
      });
      for (const shipment of shipments) {
        shipment.status = ShipmentStatus.DELIVERED;
        shipment.delivered_at = new Date();
        await manager.save(shipment);
      }
      await manager.save(shopOrder);
      await manager.save(
        manager.create(OrderStatusHistory, {
          order_id: shopOrder.order_id,
          shop_order_id: shopOrder.id,
          actor_user_id: String(buyerId),
          from_status: ShopOrderStatus.SHIPPED,
          to_status: ShopOrderStatus.COMPLETED,
        }),
      );
      await this.syncParentOrderStatus(
        manager,
        shopOrder.order_id,
        buyerId,
      );

      return {
        id: shopOrder.id,
        status: shopOrder.status,
        shipping_status: shopOrder.shipping_status,
      };
    });
  }

  async remove(_id: string) {
    throw new ConflictException(
      'Orders are retained for audit and cannot be deleted.',
    );
  }

  private findSellerShop(userId: number) {
    return this.shopRepo.findOne({
      where: { user: { id: String(userId) } },
      select: ['id'],
    });
  }

  private async syncParentOrderStatus(
    manager: EntityManager,
    orderId: string,
    actorUserId: number,
  ) {
    const shopOrders = await manager.find(ShopOrder, {
      where: { order_id: orderId },
    });
    if (shopOrders.length === 0) return;

    const statuses = shopOrders.map((shopOrder) => shopOrder.status);
    let status: OrderStatus;
    if (statuses.every((value) => value === ShopOrderStatus.COMPLETED)) {
      status = OrderStatus.COMPLETED;
    } else if (
      statuses.every((value) =>
        [ShopOrderStatus.SHIPPED, ShopOrderStatus.COMPLETED].includes(value),
      )
    ) {
      status = OrderStatus.SHIPPED;
    } else if (
      statuses.some((value) =>
        [
          ShopOrderStatus.PROCESSING,
          ShopOrderStatus.SHIPPED,
          ShopOrderStatus.COMPLETED,
        ].includes(value),
      )
    ) {
      status = OrderStatus.PROCESSING;
    } else if (statuses.every((value) => value === ShopOrderStatus.PAID)) {
      status = OrderStatus.PAID;
    } else if (
      statuses.every((value) => value === ShopOrderStatus.PENDING_PAYMENT)
    ) {
      status = OrderStatus.PENDING_PAYMENT;
    } else if (statuses.every((value) => value === ShopOrderStatus.CANCELLED)) {
      status = OrderStatus.CANCELLED;
    } else {
      status = OrderStatus.PROCESSING;
    }

    const order = await manager.findOne(Order, { where: { id: orderId } });
    if (!order || order.status === status) return;

    const previousStatus = order.status;
    order.status = status;
    if (
      status === OrderStatus.COMPLETED &&
      order.payment_status === OrderPaymentStatus.PENDING
    ) {
      const codPayment = await manager.findOne(Payment, {
        where: {
          order_id: order.id,
          method: 'cod',
          status: PaymentStatus.PENDING,
        },
      });
      if (codPayment) {
        order.payment_status = OrderPaymentStatus.PAID;
        codPayment.status = PaymentStatus.SUCCEEDED;
        codPayment.paid_at = new Date();
        await manager.save(codPayment);
      }
    }
    await manager.save(order);
    await manager.save(
      manager.create(OrderStatusHistory, {
        order_id: order.id,
        actor_user_id: String(actorUserId),
        from_status: previousStatus,
        to_status: status,
      }),
    );
  }

  private toSafeBuyer(buyer: Order['buyer']) {
    return buyer
      ? {
          id: buyer.id,
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
        }
      : null;
  }

  private toSafeItem(item: Order['items'][number]) {
    return {
      id: item.id,
      product_name: item.product_name,
      sku: item.sku,
      variant_label: item.variant_label,
      image_url: item.image_url,
      price: item.price,
      quantity: item.quantity,
      shop_id: item.shop_id,
      product_id: item.product_variant?.product_id ?? null,
    };
  }

  private toAdminOrder(order: Order) {
    return {
      id: order.id,
      order_no: order.order_no,
      buyer: this.toSafeBuyer(order.buyer),
      shipping_address: order.shipping_address,
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      discount_amount: order.discount_amount,
      total_amount: order.total_amount,
      currency: order.currency,
      status: order.status,
      payment_status: order.payment_status,
      cancelled_reason: order.cancelled_reason,
      cancelled_at: order.cancelled_at,
      items: (order.items ?? []).map((item) => this.toSafeItem(item)),
      shop_orders: (order.shop_orders ?? []).map((shopOrder) => ({
        id: shopOrder.id,
        shop_order_no: shopOrder.shop_order_no,
        shop_id: shopOrder.shop_id,
        shop: shopOrder.shop
          ? { id: shopOrder.shop.id, name: shopOrder.shop.name }
          : null,
        subtotal: shopOrder.subtotal,
        shipping_fee: shopOrder.shipping_fee,
        discount_amount: shopOrder.discount_amount,
        total_amount: shopOrder.total_amount,
        currency: shopOrder.currency,
        status: shopOrder.status,
        shipping_status: shopOrder.shipping_status,
        shippings: (shopOrder.shippings ?? []).map((shipping) => ({
          id: shipping.id,
          carrier: shipping.carrier,
          tracking_number: shipping.tracking_number,
          status: shipping.status,
          shipped_at: shipping.shipped_at,
          delivered_at: shipping.delivered_at,
        })),
        items: (shopOrder.items ?? []).map((item) =>
          this.toSafeItem(item),
        ),
      })),
      status_history: order.status_history ?? [],
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }

  private toSellerOrder(shopOrder: ShopOrder) {
    const order = shopOrder.order;
    return {
      id: shopOrder.id,
      order_id: shopOrder.order_id,
      order_no: order.order_no,
      shop_order_no: shopOrder.shop_order_no,
      shop_id: shopOrder.shop_id,
      subtotal: shopOrder.subtotal,
      shipping_fee: shopOrder.shipping_fee,
      discount_amount: shopOrder.discount_amount,
      total_amount: shopOrder.total_amount,
      currency: shopOrder.currency,
      status: shopOrder.status,
      shipping_status: shopOrder.shipping_status,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      shippings: (shopOrder.shippings ?? []).map((shipping) => ({
        id: shipping.id,
        carrier: shipping.carrier,
        tracking_number: shipping.tracking_number,
        status: shipping.status,
        shipped_at: shipping.shipped_at,
        delivered_at: shipping.delivered_at,
      })),
      buyer: this.toSafeBuyer(order.buyer),
      items: (shopOrder.items ?? [])
        .filter((item) => item.shop_id === shopOrder.shop_id)
        .map((item) => this.toSafeItem(item)),
      status_history: shopOrder.status_history ?? [],
      created_at: shopOrder.created_at,
      updated_at: shopOrder.updated_at,
    };
  }
}
