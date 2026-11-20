import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { InventoryReservationStatus } from '@/common/enums/marketplace.enums';
import { Order } from 'src/order/entities/order.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index('uq_inventory_reservations_key', ['reservation_key'], { unique: true })
@Index('idx_inventory_reservations_expiry', ['status', 'expires_at'])
@Index('idx_inventory_reservations_order_status', ['order_id', 'status'])
@Check('"quantity" > 0')
@Entity('inventory_reservations')
export class InventoryReservation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uuid' })
  reservation_key: string;

  @Column({ name: 'order_id', type: 'bigint', transformer: bigintStringTransformer })
  order_id: string;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    name: 'product_variant_id',
    type: 'bigint',
    transformer: bigintStringTransformer,
  })
  product_variant_id: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_variant_id' })
  product_variant: ProductVariant;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'enum',
    enum: InventoryReservationStatus,
    default: InventoryReservationStatus.HOLDING,
  })
  status: InventoryReservationStatus;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
