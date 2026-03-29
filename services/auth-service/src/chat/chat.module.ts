import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AuthModule } from '../auth/auth.module';
import { UserProfile } from '../auth/entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, UserProfile]), AuthModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
