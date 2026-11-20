import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';
import { Order } from 'src/order/entities/order.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { ShopOrder } from 'src/shop-order/entities/shop-order.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Check('"quantity" > 0')
@Check('"price" >= 0')
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint', transformer: bigintStringTransformer })
  order_id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'shop_order_id', type: 'bigint', transformer: bigintStringTransformer })
  shop_order_id: string;

  @ManyToOne(() => ShopOrder, (shopOrder) => shopOrder.items, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'shop_order_id' })
  shop_order: ShopOrder;

  @Column({ name: 'shop_id', type: 'bigint', transformer: bigintStringTransformer })
  shop_id: string;

  @ManyToOne(() => Shop, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_variant_id' })
  product_variant: ProductVariant;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'varchar', length: 255 })
  sku: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  variant_label: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image_url: string | null;

  @Column('numeric', { precision: 18, scale: 2 })
  price: string;

  @Column({ type: 'int' })
  quantity: number;
}
