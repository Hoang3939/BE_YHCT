import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth-shared/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

type UploadedAttachment = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

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

  @Patch('conversations/:id/title')
  updateTitle(
    @Req() req,
    @Param('id') conversationId: string,
    @Body('title') title: string,
  ) {
    return this.chatService.updateTitle(req.user.userId, conversationId, title);
  }

  @Post('messages/:id/feedback')
  addFeedback(
    @Param('id') messageId: string,
    @Body() body: { type: 'good' | 'bad' | 'copy'; note?: string },
  ) {
    return this.chatService.addFeedback(messageId, body.type, body.note);
  }

  @Delete('messages/:id/feedback')
  removeFeedback(@Param('id') messageId: string) {
    return this.chatService.removeFeedback(messageId);
  }

  @Get('stats')
  getStats() {
    return this.chatService.getStats();
  }

  @Get('stats/heatmap')
  getHeatmap() {
    return this.chatService.getHeatmap();
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
