import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type RevokedTokenType = 'access' | 'refresh';

@Entity({ name: 'RevokedToken' })
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid', { name: 'revokedTokenId' })
  revokedTokenId: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier' })
  accountId: string;

  @Column({ name: 'jti', type: 'nvarchar', length: 255, unique: true })
  jti: string;

  @Column({ name: 'tokenType', type: 'nvarchar', length: 20, default: 'access' })
  tokenType: RevokedTokenType;

  @CreateDateColumn({ name: 'revokedAt', type: 'datetime2', precision: 7 })
  revokedAt: Date;

  @Column({ name: 'expiresAt', type: 'datetime2', precision: 7 })
  expiresAt: Date;

  @Column({ name: 'reason', type: 'nvarchar', length: 255, nullable: true })
  reason: string | null;
}
