import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../constants/role.enum';
import { AuthenticatedUser } from '../types/authenticated-user.interface';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      return false;
    }

    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const tenantId: string | null = request.tenantId;
    if (!tenantId || user.barbershopId !== tenantId) {
      throw new ForbiddenException('User does not belong to this tenant');
    }

    return true;
  }
}
