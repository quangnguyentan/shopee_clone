import { Shop } from 'src/shop/entities/shop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ unique: true })
  code: string;

  @Column()
  discount_type: 'percent' | 'fixed';

  @Column('decimal')
  discount_value: number;

  @Column()
  expired_at: Date;
}
