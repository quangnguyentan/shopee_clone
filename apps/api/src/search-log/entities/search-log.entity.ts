// search-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';

@Entity('search_logs')
@Index(['created_at'])
@Index(['product_id'])
@Index(['keyword'])
@Index('idx_search_logs_user_created_at', ['user_id', 'created_at'])
export class SearchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyword: string;

  @Column({ type: 'bigint', nullable: true })
  product_id: number | null;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  user_id: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @CreateDateColumn()
  created_at: Date;
}
