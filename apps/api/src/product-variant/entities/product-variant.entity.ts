import { BaseEntity } from '@/base/base.entity';
import { ProductVariantAttribute } from '@/product-variant-attributes/entities/product-variant-attribute.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ unique: true })
  sku: string;

  @Column('decimal')
  price: number;

  @Column()
  stock: number;

  @OneToMany(() => ProductVariantAttribute, (attr) => attr.variant)
  attributes: ProductVariantAttribute[];
}
