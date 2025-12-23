import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('shippings')
export class Shipping {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'text' })
  address: string;

  @Column('decimal')
  shipping_fee: number;

  @Column()
  status: string;
}
