import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('Message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column({ type: 'uniqueidentifier' })
  conversationId: string;

  @Column({ type: 'nvarchar', length: 15 })
  role: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  content: string;

  @CreateDateColumn({ type: 'datetime2' })
  timestamp: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}
