import { Shop } from '@/shop/entities/shop.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('shop_follows')
export class ShopFollow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'bigint' })
  shop_id: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @CreateDateColumn()
  created_at: Date;
}
