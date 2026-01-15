import { BaseEntity } from '@/base/base.entity';
import { ProductVariant } from 'src/product-variant/entities/product-variant.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('variant_options')
export class VariantOption extends BaseEntity {
  @Column()
  variant_id: number;

  @ManyToOne(() => ProductVariant, (v) => v.options)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column()
  option_name: string; // Color, Size

  @Column()
  option_value: string; // Red, XL
}
