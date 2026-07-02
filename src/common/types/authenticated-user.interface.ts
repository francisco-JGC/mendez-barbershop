import { Role } from '../constants/role.enum';

export interface AuthenticatedUser {
  userId: string;
  name: string;
  email: string | null;
  username: string | null;
  role: Role;
  barbershopId: string | null;
  barbershopName: string | null;
}
