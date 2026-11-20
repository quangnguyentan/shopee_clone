import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { PaymentStatus } from '@/common/enums/marketplace.enums';
import { Order } from 'src/order/entities/order.entity';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('uq_payments_idempotency_key', ['idempotency_key'], {
  unique: true,
  where: '"idempotency_key" IS NOT NULL',
})
@Index('uq_payments_provider_transaction', ['provider', 'provider_transaction_id'], {
  unique: true,
  where: '"provider_transaction_id" IS NOT NULL',
})
@Index('idx_payments_order_created', ['order_id', 'created_at'])
@Check('"amount" >= 0')
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint', transformer: bigintStringTransformer })
  order_id: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 32 })
  method: string;

  @Column({ type: 'varchar', length: 64, default: 'legacy' })
  provider: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  amount: string;

  @Column({ type: 'char', length: 3, default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_transaction_id: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  idempotency_key: string | null;

  @Column({ type: 'text', nullable: true })
  failure_reason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
