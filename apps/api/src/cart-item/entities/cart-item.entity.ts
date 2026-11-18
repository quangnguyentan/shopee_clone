import { Cart } from 'src/cart/entities/cart.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index(['cart', 'product_variant'], { unique: true })
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => ProductVariant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_variant_id' })
  product_variant: ProductVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
