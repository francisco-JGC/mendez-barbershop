import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  IServiceRepository,
  NewService,
} from '../../domain/service.repository';
import { Service } from '../../domain/service.entity';
import { ServiceOrmEntity } from './service.orm-entity';
import { ServiceMapper } from './service.mapper';

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly ormRepository: Repository<ServiceOrmEntity>,
  ) {}

  async findAllByTenant(barbershopId: string): Promise<Service[]> {
    const rows = await this.ormRepository.find({ where: { barbershopId } });
    return rows.map((row) => ServiceMapper.toDomain(row));
  }

  async findById(id: string): Promise<Service | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? ServiceMapper.toDomain(row) : null;
  }

  async findByIds(barbershopId: string, ids: string[]): Promise<Service[]> {
    if (ids.length === 0) return [];
    const rows = await this.ormRepository.find({
      where: { barbershopId, id: In(ids) },
    });
    return rows.map((row) => ServiceMapper.toDomain(row));
  }

  async create(data: NewService): Promise<Service> {
    const created = this.ormRepository.create(data);
    const saved = await this.ormRepository.save(created);
    return ServiceMapper.toDomain(saved);
  }

  async save(service: Service): Promise<Service> {
    const saved = await this.ormRepository.save(
      ServiceMapper.toPersistence(service),
    );
    return ServiceMapper.toDomain(saved);
  }
}
