import {
  BadRequestException,
  ConflictException,
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

  /**
   * [barbershopId] is the tenant context of the caller — used to scope
   * barber/seller creation. Admins ignore it: they are branch-agnostic and
   * always end up with `barbershopId = null` so they can switch branches
   * from the header.
   */
  async execute(barbershopId: string, dto: CreateUserDto): Promise<User> {
    // Barbers and sellers log in with a username (short, memorable, no email
    // account needed). Admins keep email-based identity because they usually
    // have one and it doubles as their contact method.
    const usesUsername = dto.role === Role.BARBER || dto.role === Role.SELLER;
    // Admins are pinned to no branch — every admin is a "jefe" that manages
    // all branches via the header switcher (Escenario A, single admin role).
    const targetBarbershopId = dto.role === Role.ADMIN ? null : barbershopId;

    // Normalize identity fields at creation time so login lookups (which are
    // also normalized) always match. Without this, a barber created as
    // "Juan.Perez" would fail to log in when they type "juan.perez".
    const normalizedUsername = dto.username?.trim().toLowerCase();
    const normalizedEmail = dto.email?.trim().toLowerCase();

    if (usesUsername) {
      if (!normalizedUsername) {
        throw new BadRequestException(
          'Barbers and sellers must have a username',
        );
      }
      const existing = await this.userRepository.findByUsername(
        barbershopId,
        normalizedUsername,
      );
      if (existing) {
        throw new ConflictException('Username already in use for this tenant');
      }
    } else {
      if (!normalizedEmail) {
        throw new BadRequestException('Admins must have an email');
      }
      // Admins are global, so uniqueness must also be checked globally
      // (barbershopId = null).
      const existing = await this.userRepository.findByEmail(
        null,
        normalizedEmail,
      );
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      barbershopId: targetBarbershopId,
      name: dto.name,
      email: usesUsername ? null : (normalizedEmail ?? null),
      username: usesUsername ? (normalizedUsername ?? null) : null,
      passwordHash,
      role: dto.role,
    });
  }
}
