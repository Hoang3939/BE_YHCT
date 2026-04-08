import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Ebook } from './ebook.entity';

export type PipelineStatus = 'pending_approval' | 'pending' | 'processing' | 'completed' | 'failed';

@Entity('DataPipeline')
export class DataPipeline {
  @PrimaryGeneratedColumn('uuid', { name: 'jobId' })
  id!: string;

  @Column({ type: 'uniqueidentifier' })
  ebookId!: string;

  @Column({ type: 'nvarchar', length: 50, default: 'full_pipeline' })
  processingType!: string;

  @Column({ type: 'nvarchar', length: 50, default: 'pending_approval' })
  status!: PipelineStatus;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt!: Date;

  @ManyToOne(() => Ebook, (ebook) => ebook.pipelines, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'ebookId' })
  ebook!: Ebook;
}
