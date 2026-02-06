// flash-sale/entities/flash-sale.entity.ts
import { FlashSaleItem } from '@/flash-sale-item/entities/flash-sale-item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity('flash_sales')
export class FlashSale {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  name: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  banner_image: string;

  @Column({ default: 0 })
  priority: number; // ưu tiên hiển thị nếu nhiều flash sale

  @OneToMany(() => FlashSaleItem, (item) => item.flash_sale)
  items: FlashSaleItem[];

  @CreateDateColumn()
  created_at: Date;
}
