import { Role } from '../../../common/constants/role.enum';
import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface NewUser {
  barbershopId: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(barbershopId: string | null, email: string): Promise<User | null>;
  findAllByTenant(barbershopId: string): Promise<User[]>;
  create(data: NewUser): Promise<User>;
  save(user: User): Promise<User>;
}
