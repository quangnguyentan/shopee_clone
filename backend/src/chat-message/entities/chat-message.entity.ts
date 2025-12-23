import { Shop } from 'src/shop/entities/shop.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'receiver_shop_id' })
  shop: Shop;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  created_at: Date;
}
