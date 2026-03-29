import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevokedToken } from './entities/revoked-token.entity';
import { JwtStrategy } from './guards/jwt.strategy';
import { AuthSharedService } from './auth-shared.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RevokedToken]),
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthSharedService, JwtStrategy],
  exports: [AuthSharedService, JwtModule],
})
export class AuthSharedModule {}
