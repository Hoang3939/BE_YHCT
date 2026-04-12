import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';

export type AccountRole = 'admin' | 'user' | 'expert';
export type AccountStatus = 'pending' | 'active' | 'locked';

@Entity({ name: 'Account' })
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'accountId' })
  accountId: string;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'nvarchar', length: 255 })
  email: string;

  @Column({ name: 'passwordHash', type: 'nvarchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'role', type: 'nvarchar', length: 10, default: 'user' })
  role: AccountRole;

  @Column({ name: 'status', type: 'nvarchar', length: 10, default: 'pending' })
  status: AccountStatus;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime2', precision: 7 })
  updatedAt: Date;
}
