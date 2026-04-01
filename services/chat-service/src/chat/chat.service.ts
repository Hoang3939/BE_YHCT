import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { UserMemory } from './entities/user-memory.entity';

type UploadedAttachment = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

const AUTH_SERVICE_URL = 'http://localhost:3001';
const RAG_SERVICE_URL = 'http://localhost:8000';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(UserMemory)
    private userMemoryRepo: Repository<UserMemory>,
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

  /** Fetch useMemory + customInstructions from auth-service (internal, no JWT) */
  private async getUserSettings(userId: string): Promise<{ useMemory: boolean; customInstructions: string | null }> {
    try {
      const res = await fetch(`${AUTH_SERVICE_URL}/auth/internal/profile/${userId}`);
      if (!res.ok) return { useMemory: false, customInstructions: null };
      const data = (await res.json()) as { useMemory?: boolean; customInstructions?: string | null };
      return {
        useMemory: data.useMemory ?? false,
        customInstructions: data.customInstructions ?? null,
      };
    } catch {
      return { useMemory: false, customInstructions: null };
    }
  }

  /** After reply is sent, extract and save key health facts in the background */
  private async extractAndSaveFacts(userId: string, userTurn: string, aiTurn: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('user_turn', userTurn);
      formData.append('ai_turn', aiTurn);

      const res = await fetch(`${RAG_SERVICE_URL}/extract-facts`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) return;

      const payload = (await res.json()) as { facts: string[] };
      if (!payload.facts?.length) return;

      // Load existing memory contents to avoid duplicates
      const existing = await this.userMemoryRepo.find({ where: { userId } });
      const existingSet = new Set(existing.map((m) => m.content.trim().toLowerCase()));

      for (const fact of payload.facts) {
        const normalized = fact.trim();
        if (!normalized || existingSet.has(normalized.toLowerCase())) continue;
        const memory = this.userMemoryRepo.create({ userId, content: normalized });
        await this.userMemoryRepo.save(memory);
        existingSet.add(normalized.toLowerCase());
      }
    } catch {
      // Silent fail — memory extraction is best-effort
    }
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

    // Fetch user settings (useMemory, customInstructions) from auth-service
    const { useMemory, customInstructions } = await this.getUserSettings(userId);

    let aiReply = 'Có lỗi xảy ra khi gọi mô hình AI.';

    try {
      const formData = new FormData();
      formData.append('message', text);
      formData.append('conversation_id', conversation.conversationId);

      // Pass custom instructions to RAG
      if (customInstructions) {
        formData.append('custom_instructions', customInstructions);
      }

      // Fetch past messages and pass as history for cross-session memory
      const pastMessages = await this.messageRepo.find({
        where: { conversationId: conversation.conversationId },
        order: { timestamp: 'ASC' },
        take: 20,
      });
      // Exclude the user message we just saved (last item)
      const historyMessages = pastMessages.slice(0, -1);
      if (historyMessages.length > 0) {
        const historyText = historyMessages
          .map((m) => (m.role === 'user' ? `Người dùng: ${m.content}` : `AI: ${m.content}`))
          .join('\n');
        formData.append('history', historyText);
      }

      // Long-term memory: inject facts from past conversations if enabled
      if (useMemory) {
        const memories = await this.userMemoryRepo.find({ where: { userId } });
        if (memories.length > 0) {
          const memoryText = memories.map((m) => `- ${m.content}`).join('\n');
          formData.append('long_term_memory', memoryText);
        }
      }

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

      const response = await fetch(`${RAG_SERVICE_URL}/chat`, {
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

    // Async background: extract & save key health facts (no await — does not block response)
    this.extractAndSaveFacts(userId, text, aiReply).catch(() => {});

    return {
      conversationId: conversation.conversationId,
      reply: aiReply,
    };
  }
}
