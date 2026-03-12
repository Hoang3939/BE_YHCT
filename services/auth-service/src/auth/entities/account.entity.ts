import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

export type AccountRole = 'Admin' | 'User';
export type AccountStatus = 'Pending' | 'Active';

@Entity({ name: 'Account' })
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'accountId' })
  accountId: string;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'nvarchar', length: 255 })
  email: string;

  @Column({ name: 'passwordHash', type: 'nvarchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'role', type: 'nvarchar', length: 10, default: 'User' })
  role: AccountRole;

  @Column({ name: 'status', type: 'nvarchar', length: 10, default: 'Pending' })
  status: AccountStatus;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;
}
