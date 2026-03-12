import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'User' })
export class UserProfile {
  @PrimaryGeneratedColumn('uuid', { name: 'userId' })
  userId: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier' })
  accountId: string;

  @Column({ name: 'fullName', type: 'nvarchar', length: 255 })
  fullName: string;

  @Column({ name: 'phoneNumber', type: 'nvarchar', length: 15, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'avatar', type: 'nvarchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ name: 'bio', type: 'nvarchar', length: 1000, nullable: true })
  bio: string | null;

  @Column({ name: 'totalQuestions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'totalContributions', type: 'int', default: 0 })
  totalContributions: number;

  @Column({ name: 'lastLoginAt', type: 'datetime2', precision: 7, nullable: true })
  lastLoginAt: Date | null;
}
