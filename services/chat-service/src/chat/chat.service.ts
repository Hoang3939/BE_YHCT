import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

type UploadedAttachment = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async getConversations(userId: string) {
    return this.conversationRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getMessages(conversationId: string) {
    return this.messageRepo.find({
      where: { conversationId },
      order: { timestamp: 'ASC' },
    });
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await this.conversationRepo.findOne({ where: { conversationId, userId } });
    if (!conversation) throw new HttpException('Conversation not found', 404);

    await this.messageRepo.delete({ conversationId });
    return this.conversationRepo.remove(conversation);
  }

  async sendMessage(
    userId: string,
    conversationId: string | null,
    text: string,
    attachments: UploadedAttachment[] = [],
  ) {
    let conversation: Conversation;

    if (!conversationId) {
      conversation = this.conversationRepo.create({
        userId,
        conversationTitle: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        lastMessageContent: text,
      });
      conversation = await this.conversationRepo.save(conversation);
    } else {
      const found = await this.conversationRepo.findOne({ where: { conversationId } });
      if (!found) throw new HttpException('Conversation not found', 404);

      conversation = found;
      conversation.lastMessageContent = text;
      conversation = await this.conversationRepo.save(conversation);
    }

    const userMessage = this.messageRepo.create({
      conversationId: conversation.conversationId,
      role: 'user',
      content: text,
    });
    await this.messageRepo.save(userMessage);

    conversation.messageCount = (conversation.messageCount || 0) + 1;
    await this.conversationRepo.save(conversation);

    let aiReply = 'Có lỗi xảy ra khi gọi mô hình AI.';

    try {
      const formData = new FormData();
      formData.append('message', text);

      const allowedExt = new Set(['.pdf', '.doc', '.docx']);
      for (const file of attachments) {
        const ext = extname(file.originalname || '').toLowerCase();
        if (!allowedExt.has(ext)) {
          throw new HttpException(`File không hợp lệ: ${file.originalname}`, 400);
        }

        const mimeType = file.mimetype || (ext === '.pdf' ? 'application/pdf' : 'application/msword');
        const bytes = new Uint8Array(file.buffer.length);
        bytes.set(file.buffer);
        const blob = new Blob([bytes], { type: mimeType });
        formData.append('attachments', blob, file.originalname);
      }

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`RAG API error ${response.status}: ${errText}`);
      }

      const payload = (await response.json()) as { reply: string };
      aiReply = payload.reply;
    } catch (error) {
      console.error('Error asking RAG API', error);
    }

    const aiMessage = this.messageRepo.create({
      conversationId: conversation.conversationId,
      role: 'assistant',
      content: aiReply,
    });
    await this.messageRepo.save(aiMessage);

    conversation.lastMessageContent = aiReply;
    conversation.messageCount = conversation.messageCount + 1;
    await this.conversationRepo.save(conversation);

    return {
      conversationId: conversation.conversationId,
      reply: aiReply,
    };
  }
}
