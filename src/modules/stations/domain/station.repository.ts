import { Station } from './station.entity';

export const STATION_REPOSITORY = Symbol('STATION_REPOSITORY');

export interface NewStation {
  barbershopId: string;
  number: number;
}

export interface IStationRepository {
  findAllByTenant(barbershopId: string): Promise<Station[]>;
  findById(id: string): Promise<Station | null>;
  create(data: NewStation): Promise<Station>;
  save(station: Station): Promise<Station>;
}
