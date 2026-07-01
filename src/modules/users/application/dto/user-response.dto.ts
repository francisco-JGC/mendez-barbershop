import { Role } from '../../../../common/constants/role.enum';
import { User } from '../../domain/user.entity';

export class UserResponseDto {
  id: string;
  barbershopId: string | null;
  name: string;
  email: string | null;
  username: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.barbershopId = user.barbershopId;
    dto.name = user.name;
    dto.email = user.email;
    dto.username = user.username;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
