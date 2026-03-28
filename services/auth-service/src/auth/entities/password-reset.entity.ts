import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'PasswordResetToken' })
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid', { name: 'idReset' })
  idReset: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier' })
  accountId: string;

  @Column({ name: 'token', type: 'nvarchar', length: 'MAX' as unknown as number })
  token: string;

  @Column({ name: 'expiresAt', type: 'datetime2', precision: 7 })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;

  @Column({ name: 'used', type: 'bit', default: false })
  used: boolean;
}
