import { BaseEntity } from '@/base/base.entity';
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Index('idx_product_images_order', ['product_id', 'sort_order'])
@Index('uq_product_images_primary', ['product_id'], {
  unique: true,
  where: '"is_primary" = true',
})
@Entity('product_images')
export class ProductImage extends BaseEntity {
  @Column({ name: 'product_id', type: 'bigint' })
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  url: string;

  @Column({ default: false })
  is_primary: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;
}
