import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAuth } from '@clerk/express';

export const UserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const { userId } = getAuth(req);

    if (!userId) {
      throw new UnauthorizedException();
    }
    return userId;
  },
);
