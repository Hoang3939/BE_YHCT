import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'UserMemory' })
export class UserMemory {
  @PrimaryGeneratedColumn('uuid', { name: 'memoryId' })
  memoryId: string;

  @Column({ name: 'userId', type: 'uniqueidentifier' })
  userId: string;

  @Column({ name: 'content', type: 'nvarchar', length: 'MAX' })
  content: string;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime2', precision: 7 })
  updatedAt: Date;
}
