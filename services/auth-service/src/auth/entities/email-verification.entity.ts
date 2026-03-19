import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'EmailVerification' })
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid', { name: 'idVerification' })
  idVerification: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier' })
  accountId: string;

  @Column({ name: 'token', type: 'nvarchar', length: 255 })
  token: string;

  @Column({ name: 'expiresAt', type: 'datetime2', precision: 7 })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;
}
