import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [PassportModule],
  providers: [JwtAuthGuard, RolesGuard, JwtStrategy],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
