import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Session } from '@/session/entities/session.entity';

@Index('uq_refresh_tokens_jti', ['jti'], { unique: true })
@Index('idx_refresh_tokens_expires', ['expires_at'])
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @Column()
  sessionId: string;

  @Column({ type: 'varchar', length: 255 })
  token_hash: string;

  @Column({ default: false })
  revoked: boolean;

  @Column()
  jti: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
