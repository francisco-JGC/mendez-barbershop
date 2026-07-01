import { AuthenticatedUser } from './authenticated-user.interface';

declare module 'express' {
  interface Request {
    tenantId: string | null;
    user?: AuthenticatedUser;
  }
}
