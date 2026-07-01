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

    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const tenantId = request.tenantId;
    if (!tenantId || user.barbershopId !== tenantId) {
      throw new ForbiddenException('User does not belong to this tenant');
    }

    return true;
  }
}
