import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  receiver_name: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ default: false })
  is_default: boolean;
}
