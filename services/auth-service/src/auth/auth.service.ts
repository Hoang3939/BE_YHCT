import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Account } from './entities/account.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const email = dto.email.trim().toLowerCase();
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const existing = await this.accountRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const account = this.accountRepository.create({
      email,
      passwordHash,
      role: 'User',
      status: 'Active',
    });

    const savedAccount = await this.accountRepository.save(account);

    const profile = this.userProfileRepository.create({
      accountId: savedAccount.accountId,
      fullName: dto.fullName,
      totalQuestions: 0,
      totalContributions: 0,
    });

    await this.userProfileRepository.save(profile);

    return {
      message: 'Account created',
    };
  }

  async verifyEmail() {
    return { message: 'Verification not required' };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const account = await this.accountRepository.findOne({ where: { email } });
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.status !== 'Active') {
      throw new UnauthorizedException('Account not active');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { accountId: account.accountId },
    });

    if (profile) {
      profile.lastLoginAt = new Date();
      await this.userProfileRepository.save(profile);
    }

    const token = await this.jwtService.signAsync({
      sub: profile?.userId ?? account.accountId,
      email: account.email,
      role: account.role,
      accountId: account.accountId,
    });

    return {
      token,
      role: account.role,
      redirect: '/app',
    };
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException('Token required');
    }

    return { message: 'Logged out', redirect: '/' };
  }

  async getProfile(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }

    const account = await this.accountRepository.findOne({
      where: { accountId: profile.accountId },
    });

    if (!account) {
      throw new UnauthorizedException('Account not found');
    }

    return {
      fullName: profile.fullName,
      email: account.email,
    };
  }

  async listConversations(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return this.conversationRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async createConversation(userId: string, title?: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const conversation = this.conversationRepository.create({
      userId,
      conversationTitle: title ?? 'Cuộc trò chuyện mới',
      lastMessageContent: null,
      messageCount: 0,
    });

    return this.conversationRepository.save(conversation);
  }

  async listMessages(userId: string, conversationId: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { conversationId, userId },
    });

    if (!conversation) {
      throw new UnauthorizedException('Conversation not found');
    }

    return this.messageRepository.find({
      where: { conversationId },
      order: { timestamp: 'ASC' },
    });
  }

  async addMessage(userId: string, conversationId: string, role: string, content: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (!content?.trim()) {
      throw new BadRequestException('Message content required');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { conversationId, userId },
    });

    if (!conversation) {
      throw new UnauthorizedException('Conversation not found');
    }

    const message = this.messageRepository.create({
      conversationId,
      role,
      content,
    });

    await this.messageRepository.save(message);

    conversation.lastMessageContent = content;
    conversation.messageCount = (conversation.messageCount ?? 0) + 1;
    await this.conversationRepository.save(conversation);

    return message;
  }

  async deleteConversation(userId: string, conversationId: string) {
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { conversationId, userId },
    });

    if (!conversation) {
      throw new UnauthorizedException('Conversation not found');
    }

    await this.messageRepository.delete({ conversationId });
    await this.conversationRepository.delete({ conversationId });

    return { message: 'Conversation deleted' };
  }
}
