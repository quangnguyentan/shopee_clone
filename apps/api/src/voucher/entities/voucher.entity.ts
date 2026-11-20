import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { VoucherScope } from '@/common/enums/marketplace.enums';
import { Order } from 'src/order/entities/order.entity';
import { Shop } from 'src/shop/entities/shop.entity';
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
import { VoucherRedemption } from './voucher-redemption.entity';

@Check('"usage_limit" IS NULL OR "usage_limit" >= 0')
@Check('"per_user_limit" IS NULL OR "per_user_limit" > 0')
@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'shop_id', type: 'bigint', nullable: true, transformer: bigintStringTransformer })
  shop_id: string | null;

  @ManyToOne(() => Shop, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop | null;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'enum', enum: VoucherScope, default: VoucherScope.SHOP })
  scope: VoucherScope;

  @Column()
  discount_type: 'percent' | 'fixed';

  @Column('numeric', { precision: 18, scale: 2 })
  discount_value: string;

  @Column({ type: 'timestamptz', nullable: true })
  starts_at: Date | null;

  @Column({ type: 'timestamptz' })
  expired_at: Date;

  @Column('numeric', { precision: 18, scale: 2, default: 0 })
  min_order_amount: string;

  @Column('numeric', { precision: 18, scale: 2, nullable: true })
  max_discount: string | null;

  @Column({ type: 'int', nullable: true })
  usage_limit: number | null;

  @Column({ type: 'int', nullable: true })
  per_user_limit: number | null;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @OneToMany(() => VoucherRedemption, (redemption) => redemption.voucher)
  redemptions: VoucherRedemption[];
}
