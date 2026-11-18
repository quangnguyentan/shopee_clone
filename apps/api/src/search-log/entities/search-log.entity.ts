// search-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('search_logs')
@Index(['created_at'])
@Index(['product_id'])
@Index(['keyword'])
export class SearchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyword: string;

  @Column({ type: 'bigint', nullable: true })
  product_id: number | null;

  @CreateDateColumn()
  created_at: Date;
}
