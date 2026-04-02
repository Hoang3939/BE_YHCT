import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;
    const token = authHeader?.replace(/^Bearer\s+/i, '') ?? '';

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest<TUser = { userId: string; email?: string; role?: string }>(
    err: unknown,
    user: TUser | false | null,
    info?: { message?: string; name?: string } | Error,
  ): TUser {
    if (err || !user) {
      const reason =
        (info && 'message' in info && info.message) ||
        (info && 'name' in info && info.name) ||
        (err instanceof Error && err.message) ||
        'Unknown JWT validation error';

      this.logger.warn(`JWT validation failed: ${reason}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}
