import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { IUserRepository } from '../../domain/user.repository';
import { PASSWORD_HASHER } from '../../domain/password-hasher';
import type { IPasswordHasher } from '../../domain/password-hasher';
import { User } from '../../domain/user.entity';

@Injectable()
export class ResetUserPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    barbershopId: string,
    userId: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.belongsToTenant(barbershopId)) {
      throw new NotFoundException('User not found');
    }
    if (!user.barbershopId) {
      throw new ForbiddenException('Cannot modify this user');
    }

    user.passwordHash = await this.passwordHasher.hash(newPassword);
    user.currentRefreshTokenHash = null;
    return this.userRepository.save(user);
  }
}
