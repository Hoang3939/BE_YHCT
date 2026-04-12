import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ContributionType = 'medicine' | 'herb' | 'document';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';

@Entity({ name: 'KnowledgeContribution' })
export class KnowledgeContribution {
  @PrimaryGeneratedColumn('uuid', { name: 'contributionId' })
  contributionId!: string;

  @Column({ name: 'userId', type: 'uniqueidentifier' })
  userId!: string;

  @Column({ name: 'title', type: 'nvarchar', length: 500 })
  title!: string;

  @Column({ name: 'description', type: 'nvarchar', length: 'max', nullable: true })
  description!: string | null;

  @Column({ name: 'contributionType', type: 'nvarchar', length: 20 })
  contributionType!: ContributionType;

  @Column({ name: 'status', type: 'nvarchar', length: 15, default: "'pending'" })
  status!: ContributionStatus;

  @Column({ name: 'filePath', type: 'nvarchar', length: 500, nullable: true })
  filePath!: string | null;

  @Column({ name: 'reference', type: 'nvarchar', length: 500, nullable: true })
  reference!: string | null;

  @Column({ name: 'feedback', type: 'nvarchar', length: 'max', nullable: true })
  feedback!: string | null;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt!: Date;

  @Column({ name: 'reviewedAt', type: 'datetime2', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'reviewerId', type: 'uniqueidentifier', nullable: true })
  reviewerId!: string | null;
}
