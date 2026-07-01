import { Station } from '../../domain/station.entity';
import { StationOrmEntity } from './station.orm-entity';

export class StationMapper {
  static toDomain(orm: StationOrmEntity): Station {
    return new Station(
      orm.id,
      orm.barbershopId,
      orm.number,
      orm.status,
      orm.currentBarberId,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toPersistence(domain: Station): StationOrmEntity {
    const orm = new StationOrmEntity();
    orm.id = domain.id;
    orm.barbershopId = domain.barbershopId;
    orm.number = domain.number;
    orm.status = domain.status;
    orm.currentBarberId = domain.currentBarberId;
    return orm;
  }
}
