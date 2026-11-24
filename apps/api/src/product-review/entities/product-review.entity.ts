import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { Product } from 'src/product/entities/product.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index('uq_product_reviews_verified_order_item', ['order_item_id'], {
  unique: true,
  where: '"order_item_id" IS NOT NULL',
})
@Index('idx_product_reviews_product_created', ['product_id', 'created_at'])
@Check('"rating" BETWEEN 1 AND 5')
@Entity('product_reviews')
export class ProductReview {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'product_id', type: 'bigint', transformer: bigintStringTransformer })
  product_id: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'user_id', type: 'bigint', transformer: bigintStringTransformer })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'order_item_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintStringTransformer,
  })
  order_item_id: string | null;

  @ManyToOne(() => OrderItem, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_item_id' })
  order_item: OrderItem | null;

  @Column()
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  media_urls: string[];

  @Column({ type: 'text', nullable: true })
  shop_reply: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  shop_replied_at: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
