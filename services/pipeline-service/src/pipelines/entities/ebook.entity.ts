import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DataPipeline } from './data-pipeline.entity';

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
  storagePath!: string;

  @Column({ type: 'int', default: 0, nullable: true })
  totalChunks!: number;

  @OneToMany(() => DataPipeline, (pipeline) => pipeline.ebook)
  pipelines!: DataPipeline[];
}
