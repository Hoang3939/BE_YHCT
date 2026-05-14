import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Ebook } from './ebook.entity';

export type PipelineStatus = 'pending_approval' | 'pending' | 'processing' | 'completed' | 'failed';
export type ProcessingType = 'full_pipeline' | 'vectorization' | 'ocr';

@Entity('DataPipeline')
export class DataPipeline {
  @PrimaryGeneratedColumn('uuid', { name: 'jobId' })
  id!: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ebookId!: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  contributionId!: string | null;

  @Column({ type: 'nvarchar', length: 50, default: 'full_pipeline' })
  processingType!: ProcessingType;

  @Column({ type: 'nvarchar', length: 50, default: 'pending_approval' })
  status!: PipelineStatus;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  fileName!: string | null;

  @Column({ type: 'bigint', nullable: true })
  fileSize!: string | null;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ type: 'datetime2', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'datetime2', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt!: Date;

  @ManyToOne(() => Ebook, (ebook) => ebook.pipelines, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ebookId' })
  ebook!: Ebook | null;
}
