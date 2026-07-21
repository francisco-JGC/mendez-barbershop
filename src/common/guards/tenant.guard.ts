import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../constants/role.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admins are branch-agnostic (no barbershopId): they manage every branch
    // via the header switcher, so we don't gate them on X-Tenant-Code match.
    // Barbers and sellers are pinned to their own branch and must match.
    if (user.role === Role.ADMIN) {
      return true;
    }

    const tenantId = request.tenantId;
    if (!tenantId || user.barbershopId !== tenantId) {
      throw new ForbiddenException('User does not belong to this tenant');
    }

    return true;
  }
}
