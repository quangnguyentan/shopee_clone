import { BaseEntity } from '@/base/base.entity';
import { Category } from '@/category/entities/category.entity';
import { ProductImage } from '@/product-image/entities/product-image.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';

@Index('idx_products_category_id', ['category_id'])
@Index('idx_products_shop_id', ['shop_id'])
@Index('uq_products_shop_slug_active', ['shop_id', 'slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'bigint', transformer: bigintStringTransformer })
  shop_id: string;

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', {
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  price_min: number;

  @Column('decimal', {
    transformer: {
      to: (v: number) => v,
      from: (v: string) => Number(v),
    },
  })
  price_max: number;

  @Column()
  stock: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: 0 })
  sold_count: number; // bán được bao nhiêu

  @Column({ default: 0 })
  view_count: number; // được xem bao nhiêu

  @Column({ default: 0 })
  rating_avg: number; // điểm trung bình

  @Column({ default: 0 })
  rating_count: number; // số lượt đánh giá

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ default: false })
  is_featured: boolean;

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @Column({
    name: 'category_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintStringTransformer,
  })
  category_id: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
