// flash-sale-item/entities/flash-sale-item.entity.ts
import { FlashSale } from '@/flash-sale/entities/flash-sale.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('flash_sale_items')
@Index(['flash_sale_id', 'product_variant_id'], { unique: true })
export class FlashSaleItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  flash_sale_id: number;

  @ManyToOne(() => FlashSale, (fs) => fs.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flash_sale_id' })
  flash_sale: FlashSale;

  @Column({ type: 'bigint' })
  product_variant_id: number;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'product_variant_id' })
  product_variant: ProductVariant;

  @Column('decimal')
  flash_price: number;

  @Column({ type: 'int', nullable: true })
  discount_percent: number;

  @Column()
  stock: number;

  @Column({ default: 0 })
  sold: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
