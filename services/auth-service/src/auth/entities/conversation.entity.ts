import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Conversation' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid', { name: 'conversationId' })
  conversationId: string;

  @Column({ name: 'userId', type: 'uniqueidentifier' })
  userId: string;

  @Column({ name: 'conversationTitle', type: 'nvarchar', length: 500, nullable: true })
  conversationTitle: string | null;

  @Column({ name: 'lastMessageContent', type: 'nvarchar', length: 'MAX', nullable: true })
  lastMessageContent: string | null;

  @Column({ name: 'messageCount', type: 'int', default: 0 })
  messageCount: number;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime2', precision: 7 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'datetime2', precision: 7 })
  updatedAt: Date;
}
