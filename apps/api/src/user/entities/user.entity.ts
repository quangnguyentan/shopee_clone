import { BaseEntity } from '@/base/base.entity';
import { Order } from 'src/order/entities/order.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  Index,
  DeleteDateColumn,
} from 'typeorm';
export type AuthProvider = 'local' | 'google' | 'facebook';

@Index('uq_users_email_active', ['email'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('uq_users_phone_active', ['phone'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "phone" IS NOT NULL AND "phone" <> \'\'',
})
@Entity('users')
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  password_hash: string | null;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  legacy_password: string | null;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'buyer' })
  role: 'buyer' | 'seller' | 'admin';

  @Column({ default: 'local' })
  auth_provider: AuthProvider;

  @Column({ nullable: true })
  social_id: string;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ nullable: true })
  two_factor_secret: string;

  @Column({ type: 'smallint', default: 0 })
  admin_level: number; // 0 = normal, 1 = admin, 2 = super admin

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email_verify_otp: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  email_verify_otp_expires_at: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  last_verify_email_sent_at: Date | null;

  @OneToOne(() => Shop, (shop) => shop.user)
  shop: Shop;

  @OneToMany(() => Order, (order) => order.buyer)
  orders: Order[];
}
