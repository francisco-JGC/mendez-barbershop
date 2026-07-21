import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // `request.user` is populated by JwtAuthGuard. This decorator is only
    // ever attached to endpoints that run after that guard, so the value
    // exists by contract — safe to assert.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return request.user!;
  },
);
