import { Role } from '../constants/role.enum';

/**
 * The user payload attached to `request.user` after JWT auth.
 *
 * IMPORTANT: `barbershopId` is `null` for admins (branch-agnostic — they
 * switch branches from the header). Never assume it exists. In controllers,
 * use the `@ResolvedTenantId()` decorator which falls back to the
 * X-Tenant-Code header. In use cases, accept the barbershopId as an
 * explicit parameter from the controller.
 */
export interface AuthenticatedUser {
  userId: string;
  name: string;
  email: string | null;
  username: string | null;
  role: Role;
  barbershopId: string | null;
  barbershopName: string | null;
}
