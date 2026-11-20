import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { bigintStringTransformer } from '@/common/database/bigint-string.transformer';

@Entity('sessions')
@Index(['userId', 'deviceType', 'revoked'])
@Index('idx_sessions_expires_at', ['expiresAt'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', transformer: bigintStringTransformer })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  ip: string;

  @Column({ type: 'varchar' })
  deviceType: 'mobile' | 'desktop';

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ default: false })
  revoked: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActive: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
