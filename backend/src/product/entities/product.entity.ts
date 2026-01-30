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
} from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  shop_id: number;

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

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  category_id: number;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
