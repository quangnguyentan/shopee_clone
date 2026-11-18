import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  method: string; // COD, MOMO, VNPAY

  @Column()
  status: string; // pending, paid, failed

  @Column({ nullable: true })
  paid_at: Date;
}
