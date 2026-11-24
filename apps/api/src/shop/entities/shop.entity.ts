import { BaseEntity } from '@/base/base.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { ShopStatus } from '@/common/enums/marketplace.enums';

@Index('uq_shops_slug_active', ['slug'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Entity('shops')
export class Shop extends BaseEntity {
  @OneToOne(() => User, (user) => user.shop)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  follower_count: number;

  @Column({ type: 'int', default: 0 })
  rating_count: number;

  @Column({ type: 'int', nullable: true })
  province_code: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province_name: string | null;

  @Column({
    type: 'enum',
    enum: ShopStatus,
    default: ShopStatus.PENDING,
  })
  status: ShopStatus;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_mall: boolean;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];
}
