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
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * [barbershopId] is the tenant context of the caller — used to scope
   * barber/seller/supervisor creation. Admins ignore it: they are
   * branch-agnostic and always end up with `barbershopId = null`.
   *
   * [caller] is the user performing the request. It's used to enforce the
   * "supervisor can only create barbers/sellers of their own branch" rule —
   * supervisors cannot promote themselves nor add peers.
   */
  async execute(
    barbershopId: string,
    dto: CreateUserDto,
    caller: AuthenticatedUser,
  ): Promise<User> {
    // A supervisor may only add operative roles to their own branch. Any
    // attempt to create another supervisor or an admin is a privilege
    // escalation and must be blocked at the use case level (the controller's
    // @Roles guard already blocks non-admins/non-supervisors from calling
    // this endpoint at all).
    if (caller.role === Role.SUPERVISOR) {
      if (dto.role !== Role.BARBER && dto.role !== Role.SELLER) {
        throw new ForbiddenException(
          'Los supervisores solo pueden crear barberos y vendedores',
        );
      }
    }

    // Barbers, sellers and supervisors log in with a username (short,
    // memorable, no email account needed) and are pinned to a branch. Admins
    // use email and are global (barbershopId = null) so they can switch
    // branches from the header switcher.
    const usesUsername =
      dto.role === Role.BARBER ||
      dto.role === Role.SELLER ||
      dto.role === Role.SUPERVISOR;
    const targetBarbershopId = dto.role === Role.ADMIN ? null : barbershopId;

    // Normalize identity fields at creation time so login lookups (which are
    // also normalized) always match. Without this, a barber created as
    // "Juan.Perez" would fail to log in when they type "juan.perez".
    const normalizedUsername = dto.username?.trim().toLowerCase();
    const normalizedEmail = dto.email?.trim().toLowerCase();

    if (usesUsername) {
      if (!normalizedUsername) {
        throw new BadRequestException(
          'Barberos, vendedores y supervisores requieren nombre de usuario',
        );
      }
      const existing = await this.userRepository.findByUsername(
        barbershopId,
        normalizedUsername,
      );
      if (existing) {
        throw new ConflictException(
          'Nombre de usuario ya en uso para esta sucursal',
        );
      }
    } else {
      if (!normalizedEmail) {
        throw new BadRequestException('Los administradores requieren un correo');
      }
      // Admins are global, so uniqueness must also be checked globally
      // (barbershopId = null).
      const existing = await this.userRepository.findByEmail(
        null,
        normalizedEmail,
      );
      if (existing) {
        throw new ConflictException('Correo ya en uso');
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
