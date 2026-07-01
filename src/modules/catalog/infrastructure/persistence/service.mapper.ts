import { Service } from '../../domain/service.entity';
import { ServiceOrmEntity } from './service.orm-entity';

export class ServiceMapper {
  static toDomain(orm: ServiceOrmEntity): Service {
    return new Service(
      orm.id,
      orm.barbershopId,
      orm.name,
      orm.price,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toPersistence(domain: Service): ServiceOrmEntity {
    const orm = new ServiceOrmEntity();
    orm.id = domain.id;
    orm.barbershopId = domain.barbershopId;
    orm.name = domain.name;
    orm.price = domain.price;
    orm.isActive = domain.isActive;
    return orm;
  }
}
