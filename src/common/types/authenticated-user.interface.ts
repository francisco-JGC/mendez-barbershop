import { Role } from '../constants/role.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  barbershopId: string | null;
}
