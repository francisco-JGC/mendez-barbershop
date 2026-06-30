import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { IUserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  execute(barbershopId: string): Promise<User[]> {
    return this.userRepository.findAllByTenant(barbershopId);
  }
}
