import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailQueryDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Get('verify-email')
  verifyEmail(@Query() dto: VerifyEmailQueryDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: LogoutDto,
  ) {
    const token = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    return this.authService.logout(token, dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(
    @Req() req: { user?: { userId?: string; email?: string; role?: string } },
  ) {
    return this.authService.getProfile(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  updateMe(
    @Req() req: { user?: { userId?: string; email?: string; role?: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user?.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  changePassword(
    @Req() req: { user?: { accountId?: string } },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user?.accountId ?? '',
      body.currentPassword,
      body.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/memory')
  async updateMemorySetting(
    @Req() req: { user?: { userId?: string } },
    @Body('useMemory') useMemory: boolean,
  ): Promise<{ success: boolean; message?: string }> {
    if (!req.user?.userId) {
      throw new Error('Unauthorized');
    }
    await this.authService.updateMemorySetting(req.user.userId, useMemory);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/stats')
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
  }> {
    return this.authService.getUserStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.authService.getUsers({
      search,
      role,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { fullName?: string; email?: string; role?: string },
  ) {
    return this.authService.updateUser(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.authService.updateUserRole(id, role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.authService.updateUserStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users')
  createUser(
    @Body()
    body: {
      email: string;
      password: string;
      role?: string;
      fullName?: string;
    },
  ) {
    return this.authService.createUser(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  @HttpCode(200)
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }

  // Internal endpoint — no auth guard, internal network only
  @Get('internal/profile/:userId')
  getInternalProfile(@Param('userId') userId: string) {
    return this.authService.getProfile(userId);
  }
}
