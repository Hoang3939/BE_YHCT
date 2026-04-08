import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DataPipeline } from '../../pipelines/entities/data-pipeline.entity';

@Entity('EBook')
export class Ebook {
  @PrimaryGeneratedColumn('uuid', { name: 'ebookId' })
  id!: string;

  @Column({ name: 'bookTitle', type: 'nvarchar', length: 500 })
  title!: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  author!: string | null;

  @Column({ name: 'genre', type: 'nvarchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  description!: string | null;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  coverImage!: string | null;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  storagePath!: string;

  @Column({ type: 'int', default: 0, nullable: true })
  totalChunks!: number;

  @Column({ type: 'bit', default: false })
  isPublished!: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'int', default: 0 })
  downloadCount!: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt!: Date;

  @OneToMany(() => DataPipeline, (pipeline) => pipeline.ebook)
  pipelines!: DataPipeline[];
}
