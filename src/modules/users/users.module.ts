import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from './domain/user.repository';
import { PASSWORD_HASHER } from './domain/password-hasher';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';
import { UsersController } from './infrastructure/http/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { SetUserActiveUseCase } from './application/use-cases/set-user-active.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ResetUserPasswordUseCase } from './application/use-cases/reset-user-password.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    CreateUserUseCase,
    ListUsersUseCase,
    SetUserActiveUseCase,
    UpdateUserUseCase,
    ResetUserPasswordUseCase,
  ],
  exports: [
    USER_REPOSITORY,
    PASSWORD_HASHER,
    ListUsersUseCase,
    SetUserActiveUseCase,
    UpdateUserUseCase,
    ResetUserPasswordUseCase,
  ],
})
export class UsersModule {}
