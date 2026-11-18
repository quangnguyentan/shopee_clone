import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('sessions')
@Index(['userId', 'deviceType', 'revoked'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  userId: number;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
