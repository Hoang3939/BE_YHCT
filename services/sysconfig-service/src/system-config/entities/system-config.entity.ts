import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('SystemConfigurations')
export class SystemConfigEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  configKey!: string;

  @Column({ type: 'nvarchar', length: 'max' })
  configValue!: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  configType?: string; // 'string', 'number', 'boolean', 'json'

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'bit', default: true })
  isEditable!: boolean;

  @Column({ type: 'bit', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  lastModifiedDate!: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  lastModifiedByAdminId?: string;
}
