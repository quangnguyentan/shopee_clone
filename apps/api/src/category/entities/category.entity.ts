import { BaseEntity } from '@/base/base.entity';
import { CategoryAttribute } from '@/category-attributes/entities/category-attribute.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('categories')
export class Category extends BaseEntity {
  @ManyToOne(() => Category, (c) => c.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (c) => c.parent)
  children: Category[];

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @OneToMany(() => CategoryAttribute, (a) => a.category)
  attributes: CategoryAttribute[];
}
