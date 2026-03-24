import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

type UploadedAttachment = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getConversations(@Req() req) {
    return this.chatService.getConversations(req.user.userId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Delete('conversations/:id')
  deleteConversation(@Req() req, @Param('id') conversationId: string) {
    return this.chatService.deleteConversation(req.user.userId, conversationId);
  }

  @Post('message')
  @UseInterceptors(FilesInterceptor('attachments', 5))
  sendMessage(
    @Req() req,
    @Body() body: SendMessageDto,
    @UploadedFiles() files: UploadedAttachment[] = [],
  ) {
    return this.chatService.sendMessage(
      req.user.userId,
      body.conversationId || null,
      body.message,
      files,
    );
  }
}
