import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type SessionStatus = 'active' | 'revoked';

@Entity({ name: 'Session' })
export class Session {
  @PrimaryGeneratedColumn('uuid', { name: 'sessionId' })
  sessionId: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier' })
  accountId: string;

  @Column({ name: 'refreshToken', type: 'nvarchar', length: 'max' })
  refreshToken: string;

  @Column({ name: 'tokenType', type: 'nvarchar', length: 20, default: 'Bearer' })
  tokenType: string;

  @Column({ name: 'expiresIn', type: 'int', default: 604800 })
  expiresIn: number;

  @Column({ name: 'userAgent', type: 'nvarchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ name: 'ipAddress', type: 'nvarchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expiresAt', type: 'datetime2', precision: 7 })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;

  @Column({ name: 'status', type: 'nvarchar', length: 10, default: 'active' })
  status: SessionStatus;
}
