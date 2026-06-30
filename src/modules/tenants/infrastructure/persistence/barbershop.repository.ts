import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IBarbershopRepository,
  NewBarbershop,
} from '../../domain/barbershop.repository';
import { Barbershop } from '../../domain/barbershop.entity';
import { BarbershopOrmEntity } from './barbershop.orm-entity';
import { BarbershopMapper } from './barbershop.mapper';

@Injectable()
export class BarbershopRepository implements IBarbershopRepository {
  constructor(
    @InjectRepository(BarbershopOrmEntity)
    private readonly ormRepository: Repository<BarbershopOrmEntity>,
  ) {}

  async findAll(): Promise<Barbershop[]> {
    const rows = await this.ormRepository.find();
    return rows.map(BarbershopMapper.toDomain);
  }

  async findById(id: string): Promise<Barbershop | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? BarbershopMapper.toDomain(row) : null;
  }

  async findBySubdomain(subdomain: string): Promise<Barbershop | null> {
    const row = await this.ormRepository.findOne({ where: { subdomain } });
    return row ? BarbershopMapper.toDomain(row) : null;
  }

  async create(data: NewBarbershop): Promise<Barbershop> {
    const created = this.ormRepository.create({
      name: data.name,
      subdomain: data.subdomain,
    });
    const saved = await this.ormRepository.save(created);
    return BarbershopMapper.toDomain(saved);
  }

  async save(barbershop: Barbershop): Promise<Barbershop> {
    const saved = await this.ormRepository.save(
      BarbershopMapper.toPersistence(barbershop),
    );
    return BarbershopMapper.toDomain(saved);
  }
}
