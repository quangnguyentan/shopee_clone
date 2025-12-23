import { Product } from 'src/product/entities/product.entity';
import { VariantOption } from 'src/variant-option/entities/variant-option.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  sku: string;

  @Column('decimal')
  price: number;

  @Column()
  stock: number;

  @OneToMany(() => VariantOption, (o) => o.variant)
  options: VariantOption[];
}
