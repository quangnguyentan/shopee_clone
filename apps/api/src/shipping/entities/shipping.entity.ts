import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { ShipmentStatus } from '@/common/enums/marketplace.enums';
import { Order } from 'src/order/entities/order.entity';
import { ShopOrder } from 'src/shop-order/entities/shop-order.entity';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('uq_shippings_tracking_number', ['tracking_number'], {
  unique: true,
  where: '"tracking_number" IS NOT NULL',
})
@Index('idx_shippings_shop_order', ['shop_order_id'])
@Check('num_nonnulls("order_id", "shop_order_id") = 1')
@Check('"shipping_fee" >= 0')
@Entity('shippings')
export class Shipping {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({
    name: 'order_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintStringTransformer,
  })
  order_id: string | null;

  @OneToOne(() => Order, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order | null;

  @Column({
    name: 'shop_order_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintStringTransformer,
  })
  shop_order_id: string | null;

  @ManyToOne(() => ShopOrder, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_order_id' })
  shop_order: ShopOrder | null;

  @Column({ type: 'jsonb', nullable: true })
  address_snapshot: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  shipping_fee: string;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING })
  status: ShipmentStatus;

  @Column({ type: 'varchar', length: 64, nullable: true })
  carrier: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  tracking_number: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  shipped_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at: Date | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
