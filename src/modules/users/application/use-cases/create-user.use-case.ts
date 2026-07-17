import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { IUserRepository } from '../../domain/user.repository';
import { PASSWORD_HASHER } from '../../domain/password-hasher';
import type { IPasswordHasher } from '../../domain/password-hasher';
import { User } from '../../domain/user.entity';
import { Role } from '../../../../common/constants/role.enum';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(barbershopId: string, dto: CreateUserDto): Promise<User> {
    if (dto.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot create a super_admin user here');
    }

    // Barbers and sellers log in with a username (short, memorable, no email
    // account needed). Admins keep email-based identity because they usually
    // have one and it doubles as their contact method.
    const usesUsername = dto.role === Role.BARBER || dto.role === Role.SELLER;

    if (usesUsername) {
      if (!dto.username) {
        throw new BadRequestException(
          'Barbers and sellers must have a username',
        );
      }
      const existing = await this.userRepository.findByUsername(
        barbershopId,
        dto.username,
      );
      if (existing) {
        throw new ConflictException('Username already in use for this tenant');
      }
    } else {
      // Admin (SUPER_ADMIN was already rejected above).
      if (!dto.email) {
        throw new BadRequestException('Admins must have an email');
      }
      const existing = await this.userRepository.findByEmail(
        barbershopId,
        dto.email,
      );
      if (existing) {
        throw new ConflictException('Email already in use for this tenant');
      }
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      barbershopId,
      name: dto.name,
      email: usesUsername ? null : (dto.email ?? null),
      username: usesUsername ? (dto.username ?? null) : null,
      passwordHash,
      role: dto.role,
    });
  }
}
