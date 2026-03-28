import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Account } from './entities/account.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { Session } from './entities/session.entity';
import { UserProfile } from './entities/user-profile.entity';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      UserProfile,
      RevokedToken,
      EmailVerification,
      PasswordReset,
      Session,
    ]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
