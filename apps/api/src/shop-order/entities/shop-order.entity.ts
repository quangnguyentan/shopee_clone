import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import {
  ShopOrderShippingStatus,
  ShopOrderStatus,
} from '@/common/enums/marketplace.enums';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Order } from 'src/order/entities/order.entity';
import { OrderStatusHistory } from 'src/order-status-history/entities/order-status-history.entity';
import { Shipping } from 'src/shipping/entities/shipping.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('uq_shop_orders_order_shop', ['order_id', 'shop_id'], { unique: true })
@Index('uq_shop_orders_number', ['shop_order_no'], { unique: true })
@Index('idx_shop_orders_shop_status_created', ['shop_id', 'status', 'created_at'])
@Check('"subtotal" >= 0 AND "shipping_fee" >= 0 AND "discount_amount" >= 0 AND "total_amount" >= 0')
@Entity('shop_orders')
export class ShopOrder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint', transformer: bigintStringTransformer })
  order_id: string;

  @ManyToOne(() => Order, (order) => order.shop_orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'shop_id', type: 'bigint', transformer: bigintStringTransformer })
  shop_id: string;

  @ManyToOne(() => Shop, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ type: 'varchar', length: 48 })
  shop_order_no: string;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  subtotal: string;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  shipping_fee: string;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  discount_amount: string;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  total_amount: string;

  @Column({ type: 'char', length: 3, default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ShopOrderStatus,
    default: ShopOrderStatus.PENDING_PAYMENT,
  })
  status: ShopOrderStatus;

  @Column({
    type: 'enum',
    enum: ShopOrderShippingStatus,
    default: ShopOrderShippingStatus.UNFULFILLED,
  })
  shipping_status: ShopOrderShippingStatus;

  @Column({ type: 'text', nullable: true })
  cancelled_reason: string | null;

  @OneToMany(() => OrderItem, (item) => item.shop_order)
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.shop_order)
  status_history: OrderStatusHistory[];

  @OneToMany(() => Shipping, (shipping) => shipping.shop_order)
  shippings: Shipping[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
