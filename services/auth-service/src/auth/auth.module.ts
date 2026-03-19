import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Account } from './entities/account.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, UserProfile, Conversation, Message]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'yhct-secret',
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
