import { BaseEntity } from '@/base/base.entity';
import { CategoryAttributeValue } from '@/category-attribute-values/entities/category-attribute-value.entity';
import { Category } from '@/category/entities/category.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Index(['category_id', 'name'], { unique: true })
@Entity('category_attributes')
export class CategoryAttribute extends BaseEntity {
  @Column({ name: 'category_id', type: 'bigint' })
  category_id: number;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 100 })
  name: string; // Size, Color

  @Column({
    type: 'enum',
    enum: ['select', 'multi-select', 'input'],
    default: 'select',
  })
  type: 'select' | 'multi-select' | 'input';

  @Column({ default: false })
  allow_custom: boolean;

  @Column({ default: 0 })
  order_index: number;

  @OneToMany(() => CategoryAttributeValue, (v) => v.attribute, {
    cascade: true,
  })
  values: CategoryAttributeValue[];
}
