import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Resolves the tenant id (barbershopId) the caller wants to operate on.
 *
 * Two sources, in order:
 *   1. `user.barbershopId` — set for barbers and sellers, who are pinned to
 *      their branch and cannot switch.
 *   2. `request.tenantId` — set by the tenant middleware from the
 *      `X-Tenant-Code` header. Used by admins, who are branch-agnostic
 *      (barbershopId=null) and pick which branch via the header switcher.
 *
 * Throws `ForbiddenException` if neither is set — happens when an admin
 * forgets to select a branch before hitting a scoped endpoint.
 */
export const ResolvedTenantId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    const resolved = user?.barbershopId ?? request.tenantId ?? null;
    if (!resolved) {
      throw new ForbiddenException(
        'No barbershop context — select a branch first',
      );
    }
    return resolved;
  },
);
