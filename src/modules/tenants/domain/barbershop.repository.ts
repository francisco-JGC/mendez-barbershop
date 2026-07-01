import { Barbershop } from './barbershop.entity';

export const BARBERSHOP_REPOSITORY = Symbol('BARBERSHOP_REPOSITORY');

export interface NewBarbershop {
  name: string;
  code: string;
}

export interface IBarbershopRepository {
  findAll(): Promise<Barbershop[]>;
  findById(id: string): Promise<Barbershop | null>;
  findByCode(code: string): Promise<Barbershop | null>;
  create(data: NewBarbershop): Promise<Barbershop>;
  save(barbershop: Barbershop): Promise<Barbershop>;
}
