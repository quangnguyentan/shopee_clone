import { BaseEntity } from '@/base/base.entity';
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
  @ManyToOne(() => Category, (c) => c.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (c) => c.parent)
  children: Category[];

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;
}
