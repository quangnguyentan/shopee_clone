import { BaseEntity } from '@/base/base.entity';
import { CategoryAttributeValue } from '@/category-attribute-values/entities/category-attribute-value.entity';
import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import { ProductVariant } from '@/product-variant/entities/product-variant.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Index('uq_variant_attribute', ['variant_id', 'attribute_id'], {
  unique: true,
})
@Entity('product_variant_attributes')
export class ProductVariantAttribute extends BaseEntity {
  @Column({ name: 'variant_id', type: 'bigint' })
  variant_id: number;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ name: 'attribute_id', type: 'bigint' })
  attribute_id: number;

  @ManyToOne(() => CategoryAttribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: CategoryAttribute;

  @Column({ name: 'value_id', type: 'bigint', nullable: true })
  value_id: number | null;

  @ManyToOne(() => CategoryAttributeValue, { nullable: true })
  @JoinColumn({ name: 'value_id' })
  value: CategoryAttributeValue | null;

  @Column({
    name: 'custom_value',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  custom_value: string | null;
}
