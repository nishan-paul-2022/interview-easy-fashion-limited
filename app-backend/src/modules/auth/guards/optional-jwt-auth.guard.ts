import { Injectable, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: unknown, user: unknown, _info: unknown): TUser {
    if (err instanceof ForbiddenException) {
      throw err;
    }
    return (user || null) as TUser;
  }
}
