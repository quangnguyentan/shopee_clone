import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/product/entities/product.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryColumn({ type: 'bigint', name: 'product_id' })
  product_id: number;

  @PrimaryColumn({ type: 'bigint', name: 'category_id' })
  category_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
