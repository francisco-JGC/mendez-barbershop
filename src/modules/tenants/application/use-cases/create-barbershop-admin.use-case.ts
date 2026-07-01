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

  async execute(
    barbershopId: string,
    dto: CreateBarbershopAdminDto,
  ): Promise<User> {
    const barbershop = await this.barbershopRepository.findById(barbershopId);
    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const existing = await this.userRepository.findByEmail(
      barbershopId,
      dto.email,
    );
    if (existing) {
      throw new ConflictException('Email already in use for this tenant');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.userRepository.create({
      barbershopId,
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.ADMIN,
    });
  }
}
