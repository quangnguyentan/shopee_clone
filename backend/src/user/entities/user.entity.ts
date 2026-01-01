import { Order } from 'src/order/entities/order.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'buyer' })
  role: 'buyer' | 'seller' | 'admin';

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ nullable: true })
  two_factor_secret: string;

  @OneToOne(() => Shop, (shop) => shop.user)
  shop: Shop;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
