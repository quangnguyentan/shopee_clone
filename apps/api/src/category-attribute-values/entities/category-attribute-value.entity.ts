import { BaseEntity } from '@/base/base.entity';
import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';

@Index(['attribute_id', 'value'], { unique: true })
@Entity('category_attribute_values')
export class CategoryAttributeValue extends BaseEntity {
  @Column({
    name: 'attribute_id',
    type: 'bigint',
    transformer: bigintStringTransformer,
  })
  attribute_id: string;

  @ManyToOne(() => CategoryAttribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: CategoryAttribute;

  @Column({ length: 100 })
  value: string; // S, M, L, XL, Red, Blue
}
