import { Barbershop } from './barbershop.entity';

export const BARBERSHOP_REPOSITORY = Symbol('BARBERSHOP_REPOSITORY');

export interface NewBarbershop {
  name: string;
  subdomain: string;
}

export interface IBarbershopRepository {
  findAll(): Promise<Barbershop[]>;
  findById(id: string): Promise<Barbershop | null>;
  findBySubdomain(subdomain: string): Promise<Barbershop | null>;
  create(data: NewBarbershop): Promise<Barbershop>;
  save(barbershop: Barbershop): Promise<Barbershop>;
}
