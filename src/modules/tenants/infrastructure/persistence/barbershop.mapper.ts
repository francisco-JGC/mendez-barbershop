import { Barbershop } from '../../domain/barbershop.entity';
import { BarbershopOrmEntity } from './barbershop.orm-entity';

export class BarbershopMapper {
  static toDomain(orm: BarbershopOrmEntity): Barbershop {
    return new Barbershop(
      orm.id,
      orm.name,
      orm.subdomain,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toPersistence(domain: Barbershop): BarbershopOrmEntity {
    const orm = new BarbershopOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.subdomain = domain.subdomain;
    orm.isActive = domain.isActive;
    return orm;
  }
}
