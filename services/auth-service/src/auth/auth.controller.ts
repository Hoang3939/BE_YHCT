import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  logout(@Headers('authorization') authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    return this.authService.logout(token);
  }

  @Get('verify-email')
  verifyEmail() {
    return this.authService.verifyEmail();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: { user?: { userId?: string; email?: string; role?: string } }) {
    return this.authService.getProfile(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  listConversations(@Req() req: { user?: { userId?: string } }) {
    return this.authService.listConversations(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  createConversation(
    @Req() req: { user?: { userId?: string } },
    @Body() body: { title?: string },
  ) {
    return this.authService.createConversation(req.user?.userId ?? '', body?.title);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:conversationId/messages')
  listMessages(
    @Req() req: { user?: { userId?: string } },
    @Param('conversationId') conversationId: string,
  ) {
    return this.authService.listMessages(req.user?.userId ?? '', conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations/:conversationId/messages')
  addMessage(
    @Req() req: { user?: { userId?: string } },
    @Param('conversationId') conversationId: string,
    @Body() body: { role: string; content: string },
  ) {
    return this.authService.addMessage(
      req.user?.userId ?? '',
      conversationId,
      body.role,
      body.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations/:conversationId/delete')
  deleteConversation(
    @Req() req: { user?: { userId?: string } },
    @Param('conversationId') conversationId: string,
  ) {
    return this.authService.deleteConversation(req.user?.userId ?? '', conversationId);
  }
}
