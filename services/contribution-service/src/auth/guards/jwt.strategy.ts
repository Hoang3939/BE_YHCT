import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function extractJwtFromAuthorizationHeader(request: { headers?: { authorization?: string } }) {
  const authHeader = request?.headers?.authorization?.trim();

  if (!authHeader) {
    return null;
  }

  if (/^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  return authHeader;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const fallbackPublicKeyPath = resolve(
      process.cwd(),
      '..',
      'auth-service',
      'keys',
      'jwt.public.pem',
    );

    const publicKey = process.env.JWT_PUBLIC_KEY_BASE64
      ? Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString('utf8')
      : readFileSync(
          process.env.JWT_PUBLIC_KEY_PATH ?? fallbackPublicKeyPath,
          'utf8',
        );

    if (!publicKey.trim()) {
      throw new UnauthorizedException('JWT public key is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromAuthorizationHeader,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: { sub: string; email: string; role: string; accountId?: string }) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      accountId: payload.accountId,
    };
  }
}
