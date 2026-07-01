import { Role } from '../constants/role.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string | null;
  username: string | null;
  role: Role;
  barbershopId: string | null;
}
