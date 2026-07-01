import { Service } from './service.entity';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export interface NewService {
  barbershopId: string;
  name: string;
  price: string;
}

export interface IServiceRepository {
  findAllByTenant(barbershopId: string): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  findByIds(barbershopId: string, ids: string[]): Promise<Service[]>;
  create(data: NewService): Promise<Service>;
  save(service: Service): Promise<Service>;
}
