import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type FeedbackCategory = 'bug' | 'ux' | 'content' | 'feature_request' | 'other';
export type FeedbackSeverity = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'new' | 'reviewing' | 'resolved' | 'closed';

@Entity({ name: 'Feedback' })
export class FeedbackEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'feedbackId' })
  feedbackId!: string;

  @Column({ name: 'accountId', type: 'uniqueidentifier', nullable: true })
  accountId!: string | null;

  @Column({ name: 'fullName', type: 'nvarchar', length: 255, nullable: true })
  fullName!: string | null;

  @Column({ name: 'email', type: 'nvarchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'category', type: 'nvarchar', length: 50 })
  category!: FeedbackCategory;

  @Column({ name: 'title', type: 'nvarchar', length: 255 })
  title!: string;

  @Column({ name: 'content', type: 'nvarchar', length: 'max' })
  content!: string;

  @Column({ name: 'pageUrl', type: 'nvarchar', length: 500, nullable: true })
  pageUrl!: string | null;

  @Column({ name: 'severity', type: 'nvarchar', length: 20, nullable: true })
  severity!: FeedbackSeverity | null;

  @Column({ name: 'status', type: 'nvarchar', length: 20, default: 'new' })
  status!: FeedbackStatus;

  @Column({ name: 'handledByAdminId', type: 'uniqueidentifier', nullable: true })
  handledByAdminId!: string | null;

  @Column({ name: 'resolutionNote', type: 'nvarchar', length: 'max', nullable: true })
  resolutionNote!: string | null;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime2', precision: 7 })
  updatedAt!: Date;
}
