import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class SetUserActiveUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    barbershopId: string,
    userId: string,
    isActive: boolean,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.belongsToTenant(barbershopId)) {
      throw new NotFoundException('User not found');
    }
    if (!user.barbershopId) {
      throw new ForbiddenException('Cannot modify this user');
    }

    user.isActive = isActive;
    return this.userRepository.save(user);
  }
}
