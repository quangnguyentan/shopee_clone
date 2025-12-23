import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

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

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];

  @CreateDateColumn()
  created_at: Date;
}
