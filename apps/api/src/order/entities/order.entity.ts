import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import {
  OrderPaymentStatus,
  OrderStatus,
} from '@/common/enums/marketplace.enums';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { ShopOrder } from 'src/shop-order/entities/shop-order.entity';
import { OrderStatusHistory } from 'src/order-status-history/entities/order-status-history.entity';
import { User } from 'src/user/entities/user.entity';
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

@Index('uq_orders_order_no', ['order_no'], { unique: true })
@Index('idx_orders_buyer_status_created', ['buyer_id', 'status', 'created_at'])
@Check('"total_amount" >= 0')
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'buyer_id', type: 'bigint', transformer: bigintStringTransformer })
  buyer_id: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'varchar', length: 40 })
  order_no: string;

  @Column({ type: 'jsonb', nullable: true })
  shipping_address: Record<string, unknown> | null;

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
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderPaymentStatus,
    default: OrderPaymentStatus.PENDING,
  })
  payment_status: OrderPaymentStatus;

  @Column({ type: 'text', nullable: true })
  cancelled_reason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => ShopOrder, (shopOrder) => shopOrder.order)
  shop_orders: ShopOrder[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  status_history: OrderStatusHistory[];

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
