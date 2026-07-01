import { Role } from '../../../common/constants/role.enum';
import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface NewUser {
  barbershopId: string | null;
  name: string;
  email: string | null;
  username: string | null;
  passwordHash: string;
  role: Role;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(barbershopId: string | null, email: string): Promise<User | null>;
  findByUsername(barbershopId: string | null, username: string): Promise<User | null>;
  findByIdentifier(barbershopId: string | null, identifier: string): Promise<User | null>;
  findAllByTenant(barbershopId: string): Promise<User[]>;
  create(data: NewUser): Promise<User>;
  save(user: User): Promise<User>;
}
