import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BARBERSHOP_REPOSITORY } from '../../domain/barbershop.repository';
import type { IBarbershopRepository } from '../../domain/barbershop.repository';
import { USER_REPOSITORY } from '../../../users/domain/user.repository';
import type { IUserRepository } from '../../../users/domain/user.repository';
import { PASSWORD_HASHER } from '../../../users/domain/password-hasher';
import type { IPasswordHasher } from '../../../users/domain/password-hasher';
import { User } from '../../../users/domain/user.entity';
import { Role } from '../../../../common/constants/role.enum';
import { CreateBranchSupervisorDto } from '../dto/create-branch-supervisor.dto';

@Injectable()
export class CreateBranchSupervisorUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * Creates a supervisor pinned to [barbershopId]. Called from two places:
   *   - Inline when a new branch is being created (bootstrapping).
   *   - From the branch detail page when the admin wants to add another
   *     supervisor to an existing branch.
   *
   * Only admins are allowed to invoke this — enforced at the controller
   * level via @Roles(Role.ADMIN). Supervisors cannot create peers.
   */
  async execute(
    barbershopId: string,
    dto: CreateBranchSupervisorDto,
  ): Promise<User> {
    const barbershop = await this.barbershopRepository.findById(barbershopId);
    if (!barbershop) {
      throw new NotFoundException('Sucursal no encontrada');
    }

    const normalizedUsername = dto.username.trim().toLowerCase();

    const existing = await this.userRepository.findByUsername(
      barbershopId,
      normalizedUsername,
    );
    if (existing) {
      throw new ConflictException(
        'Nombre de usuario ya en uso para esta sucursal',
      );
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      barbershopId,
      name: dto.name,
      email: null,
      username: normalizedUsername,
      passwordHash,
      role: Role.SUPERVISOR,
    });
  }
}
