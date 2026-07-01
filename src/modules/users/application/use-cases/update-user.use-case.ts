import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { Role } from '../../../../common/constants/role.enum';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    barbershopId: string,
    userId: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.belongsToTenant(barbershopId)) {
      throw new NotFoundException('User not found');
    }
    if (!user.barbershopId) {
      throw new ForbiddenException('Cannot modify this user');
    }
    if (dto.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot assign the super_admin role here');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(
        barbershopId,
        dto.email,
      );
      if (existing && existing.id !== user.id) {
        throw new ConflictException('Email already in use for this tenant');
      }
      user.email = dto.email;
    }

    if (dto.name) {
      user.name = dto.name;
    }
    if (dto.role) {
      user.role = dto.role;
    }

    return this.userRepository.save(user);
  }
}
