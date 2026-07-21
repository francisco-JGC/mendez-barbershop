import {
  BadRequestException,
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

    // Barbers cannot have an email set, and admins cannot have a username set —
    // rejecting the mismatched fields explicitly is clearer than silently
    // dropping them and lets callers correct the request.
    const finalRole = dto.role ?? user.role;
    if (finalRole === Role.BARBER && dto.email !== undefined) {
      throw new BadRequestException('Barbers use a username, not email');
    }
    if (finalRole !== Role.BARBER && dto.username !== undefined) {
      throw new BadRequestException('Admins use email, not a username');
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

    if (dto.username && dto.username !== user.username) {
      const existing = await this.userRepository.findByUsername(
        barbershopId,
        dto.username,
      );
      if (existing && existing.id !== user.id) {
        throw new ConflictException('Username already in use for this tenant');
      }
      user.username = dto.username;
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
