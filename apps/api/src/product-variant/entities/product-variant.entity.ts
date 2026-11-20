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
  Index,
  Check,
} from 'typeorm';

@Index('uq_product_variants_product_signature', ['product_id', 'attribute_signature'], {
  unique: true,
})
@Index('idx_product_variants_product_id', ['product_id'])
@Check('"stock" >= 0')
@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @Column({ name: 'product_id', type: 'bigint' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ unique: true })
  sku: string;

  @Column('decimal')
  price: number;

  @Column('decimal', { nullable: true })
  compare_at_price: number | null;

  @Column({ type: 'varchar', length: 64 })
  attribute_signature: string;

  @Column()
  stock: number;

  @OneToMany(() => ProductVariantAttribute, (attr) => attr.variant)
  attributes: ProductVariantAttribute[];
}
