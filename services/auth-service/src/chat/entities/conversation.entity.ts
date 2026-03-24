import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('Conversation')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  conversationId: string;

  @Column({ type: 'uniqueidentifier' })
  userId: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  conversationTitle: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  lastMessageContent: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}
