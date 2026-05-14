import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { KnowledgeContribution } from './knowledge-contribution.entity';

export type ContributionAssetType = 'pdf' | 'docx' | 'image' | 'zip' | 'other';

@Entity({ name: 'ContributionAsset' })
export class ContributionAsset {
  @PrimaryGeneratedColumn('uuid', { name: 'assetId' })
  assetId!: string;

  @Column({ name: 'contributionId', type: 'uniqueidentifier' })
  contributionId!: string;

  @Column({ name: 'originalFileName', type: 'nvarchar', length: 500 })
  originalFileName!: string;

  @Column({ name: 'storedFilePath', type: 'nvarchar', length: 'max' })
  storedFilePath!: string;

  @Column({ name: 'mimeType', type: 'nvarchar', length: 100 })
  mimeType!: string;

  @Column({ name: 'fileSize', type: 'bigint' })
  fileSize!: string;

  @Column({ name: 'checksum', type: 'nvarchar', length: 255, nullable: true })
  checksum!: string | null;

  @Column({ name: 'assetType', type: 'nvarchar', length: 50 })
  assetType!: ContributionAssetType;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt!: Date;

  @ManyToOne(() => KnowledgeContribution, (contribution) => contribution.assets, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'contributionId', referencedColumnName: 'contributionId' })
  contribution!: KnowledgeContribution;
}
