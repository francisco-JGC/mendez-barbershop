import { Role } from '../../../common/constants/role.enum';

export class User {
  constructor(
    public readonly id: string,
    public barbershopId: string | null,
    public name: string,
    public email: string | null,
    public username: string | null,
    public passwordHash: string,
    public role: Role,
    public isActive: boolean,
    public currentRefreshTokenHash: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  belongsToTenant(barbershopId: string): boolean {
    return this.barbershopId === barbershopId;
  }
}
