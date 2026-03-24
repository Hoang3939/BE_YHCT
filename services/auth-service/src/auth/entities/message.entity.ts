import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Message' })
export class Message {
  @PrimaryGeneratedColumn('uuid', { name: 'messageId' })
  messageId: string;

  @Column({ name: 'conversationId', type: 'uniqueidentifier' })
  conversationId: string;

  @Column({ name: 'role', type: 'nvarchar', length: 15 })
  role: string;

  @Column({ name: 'content', type: 'nvarchar', length: 'MAX' })
  content: string;

  @CreateDateColumn({ name: 'timestamp', type: 'datetime2', precision: 7 })
  timestamp: Date;
}
