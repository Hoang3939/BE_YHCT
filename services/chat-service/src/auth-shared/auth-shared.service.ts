import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import { RevokedToken } from './entities/revoked-token.entity';

interface TokenPayload {
  sub: string;
  accountId: string;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh';
  jti: string;
}

@Injectable()
export class AuthSharedService {
  private readonly publicKey: string;

  constructor(
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
    private readonly jwtService: JwtService,
  ) {
    this.publicKey = this.loadKey(
      process.env.JWT_PUBLIC_KEY_BASE64,
      process.env.JWT_PUBLIC_KEY_PATH ??
      'services/auth-service/keys/jwt.public.pem',
    );
  }

  async isTokenRevoked(token: string) {
    try {
      const payload = this.verifyToken(token);
      const revoked = await this.revokedTokenRepository.findOne({
        where: { jti: payload.jti },
      });
      return !!revoked;
    } catch {
      return true; // Treat as revoked if verification fails
    }
  }

  verifyToken(token: string) {
    return this.jwtService.verify<TokenPayload & { exp: number }>(token, {
      publicKey: this.publicKey,
      algorithms: ['RS256'],
    });
  }

  private loadKey(base64: string | undefined, path: string) {
    if (base64) {
      return Buffer.from(base64, 'base64').toString('utf8');
    }
    // Note: This path might need to be absolute or relative to the final process.cwd()
    // For now, I'll keep it as is, but in a real microservice it would be an ENV variable.
    try {
        return readFileSync(path, 'utf8');
    } catch (e) {
        console.error(`Failed to load key from ${path}`, e);
        return '';
    }
  }
}
