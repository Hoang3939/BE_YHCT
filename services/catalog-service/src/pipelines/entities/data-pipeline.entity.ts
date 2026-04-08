import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Ebook } from '../../ebooks/entities/ebook.entity';

export type ProcessingType = 'full_pipeline';
export type PipelineStatus = 'pending_approval' | 'pending' | 'processing' | 'completed' | 'failed';

@Entity('DataPipeline')
export class DataPipeline {
  @PrimaryGeneratedColumn('uuid', { name: 'jobId' })
  id!: string;

  @Column({ type: 'uniqueidentifier' })
  ebookId!: string;

  @Column({ type: 'nvarchar', length: 50, default: 'full_pipeline' })
  processingType!: ProcessingType;

  @Column({ type: 'nvarchar', length: 50, default: 'pending_approval' })
  status!: PipelineStatus;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt!: Date;

  @ManyToOne(() => Ebook, (ebook) => ebook.pipelines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ebookId' })
  ebook!: Ebook;
}
