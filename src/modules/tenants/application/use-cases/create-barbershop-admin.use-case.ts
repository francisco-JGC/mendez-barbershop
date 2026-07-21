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
import { CreateBarbershopAdminDto } from '../dto/create-barbershop-admin.dto';

@Injectable()
export class CreateBarbershopAdminUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * Creates an admin from the "add admin" button in the branch detail page.
   * The barbershopId argument is preserved in the API signature for backward
   * compatibility (and to validate the branch exists), but after Escenario A
   * the admin itself is *global*: `barbershopId=null`, uniqueness checked
   * globally, credentials normalized to lowercase. This is the same shape
   * as an admin created via the plain `POST /users` flow.
   */
  async execute(
    barbershopId: string,
    dto: CreateBarbershopAdminDto,
  ): Promise<User> {
    const barbershop = await this.barbershopRepository.findById(barbershopId);
    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Global uniqueness: admins live in a single pool regardless of which
    // branch page kicked off the "create admin" action.
    const existing = await this.userRepository.findByEmail(
      null,
      normalizedEmail,
    );
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      barbershopId: null,
      name: dto.name,
      email: normalizedEmail,
      username: null,
      passwordHash,
      role: Role.ADMIN,
    });
  }
}
