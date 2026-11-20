import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { Order } from 'src/order/entities/order.entity';
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
import { Voucher } from './voucher.entity';

@Index('uq_voucher_redemptions_order', ['voucher_id', 'order_id'], {
  unique: true,
})
@Index('idx_voucher_redemptions_user', ['voucher_id', 'user_id'])
@Entity('voucher_redemptions')
export class VoucherRedemption {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'voucher_id', type: 'bigint', transformer: bigintStringTransformer })
  voucher_id: string;

  @ManyToOne(() => Voucher, (voucher) => voucher.redemptions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @Column({ name: 'order_id', type: 'bigint', transformer: bigintStringTransformer })
  order_id: string;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'user_id', type: 'bigint', transformer: bigintStringTransformer })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('numeric', { precision: 18, scale: 2 })
  discount_amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
