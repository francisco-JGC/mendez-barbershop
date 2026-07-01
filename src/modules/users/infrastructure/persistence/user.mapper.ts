import { User } from '../../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User(
      orm.id,
      orm.barbershopId,
      orm.name,
      orm.email,
      orm.username,
      orm.passwordHash,
      orm.role,
      orm.isActive,
      orm.currentRefreshTokenHash,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toPersistence(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.barbershopId = domain.barbershopId;
    orm.name = domain.name;
    orm.email = domain.email;
    orm.username = domain.username;
    orm.passwordHash = domain.passwordHash;
    orm.role = domain.role;
    orm.isActive = domain.isActive;
    orm.currentRefreshTokenHash = domain.currentRefreshTokenHash;
    return orm;
  }
}
