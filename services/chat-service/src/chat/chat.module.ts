import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { AuthSharedModule } from '../auth-shared/auth-shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message]), AuthSharedModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
