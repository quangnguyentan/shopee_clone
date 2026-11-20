import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { Order } from 'src/order/entities/order.entity';
import { ShopOrder } from 'src/shop-order/entities/shop-order.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('idx_order_status_history_order_created', ['order_id', 'created_at'])
@Index('idx_order_status_history_shop_order_created', ['shop_order_id', 'created_at'])
@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint', transformer: bigintStringTransformer })
  order_id: string;

  @ManyToOne(() => Order, (order) => order.status_history, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'shop_order_id', type: 'bigint', nullable: true, transformer: bigintStringTransformer })
  shop_order_id: string | null;

  @ManyToOne(() => ShopOrder, (shopOrder) => shopOrder.status_history, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'shop_order_id' })
  shop_order: ShopOrder | null;

  @Column({ name: 'actor_user_id', type: 'bigint', nullable: true, transformer: bigintStringTransformer })
  actor_user_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actor: User | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  from_status: string | null;

  @Column({ type: 'varchar', length: 32 })
  to_status: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
