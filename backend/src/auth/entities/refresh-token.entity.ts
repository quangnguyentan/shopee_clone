import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Session } from '@/session/entities/session.entity';

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

  @CreateDateColumn()
  created_at: Date;
}
