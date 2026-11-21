import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  OrderStatus,
  ShopOrderShippingStatus,
  ShopOrderStatus,
} from '@/common/enums/marketplace.enums';
import { Shop } from '@/shop/entities/shop.entity';
import { OrderStatusHistory } from '@/order-status-history/entities/order-status-history.entity';
import { Order } from './entities/order.entity';
import { ShopOrder } from '@/shop-order/entities/shop-order.entity';
import { PaginationDto } from '@/base/base.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateSellerOrderStatusDto } from './dto/update-seller-order-status.dto';

type OrderManager = { userId: number; role: 'admin' | 'seller' };

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
  ) {}

  create() {
    throw new NotImplementedException(
      'Checkout is not implemented; orders cannot be created through this endpoint yet.',
    );
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
      relations: ['order', 'order.buyer', 'items', 'status_history'],
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
      relations: ['order', 'order.buyer', 'items', 'status_history'],
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

      const updated = await manager.findOne(Order, {
        where: { id },
        relations: [
          'buyer',
          'items',
          'shop_orders',
          'shop_orders.shop',
          'shop_orders.items',
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
    const shop = await this.findSellerShop(actor.userId);
    if (!shop) throw new NotFoundException('Order not found');

    return this.dataSource.transaction(async (manager) => {
      const shopOrder = await manager.findOne(ShopOrder, {
        where: { id: shopOrderId, shop_id: shop.id },
        relations: ['order', 'order.buyer', 'items', 'status_history'],
      });
      if (!shopOrder) throw new NotFoundException('Order not found');

      const nextStatus: Partial<Record<ShopOrderStatus, ShopOrderStatus>> = {
        [ShopOrderStatus.PAID]: ShopOrderStatus.PROCESSING,
        [ShopOrderStatus.PROCESSING]: ShopOrderStatus.SHIPPED,
        [ShopOrderStatus.SHIPPED]: ShopOrderStatus.COMPLETED,
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
      } else if (dto.status === ShopOrderStatus.COMPLETED) {
        shopOrder.shipping_status = ShopOrderShippingStatus.DELIVERED;
      }

      await manager.save(shopOrder);
      await manager.save(
        manager.create(OrderStatusHistory, {
          order_id: shopOrder.order_id,
          shop_order_id: shopOrder.id,
          actor_user_id: String(actor.userId),
          from_status: previousStatus,
          to_status: dto.status,
        }),
      );

      return this.toSellerOrder(shopOrder);
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
      shipping_address: order.shipping_address,
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
