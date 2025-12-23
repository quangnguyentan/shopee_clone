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
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal')
  price_min: number;

  @Column('decimal')
  price_max: number;

  @Column()
  stock: number;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];

  @CreateDateColumn()
  created_at: Date;
}
