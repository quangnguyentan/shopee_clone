import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('variant_options')
export class VariantOption {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => ProductVariant, (v) => v.options)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column()
  option_name: string; // Color, Size

  @Column()
  option_value: string; // Red, XL
}
