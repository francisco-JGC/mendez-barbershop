import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IStationRepository,
  NewStation,
} from '../../domain/station.repository';
import { Station } from '../../domain/station.entity';
import { StationOrmEntity } from './station.orm-entity';
import { StationMapper } from './station.mapper';

@Injectable()
export class StationRepository implements IStationRepository {
  constructor(
    @InjectRepository(StationOrmEntity)
    private readonly ormRepository: Repository<StationOrmEntity>,
  ) {}

  async findAllByTenant(barbershopId: string): Promise<Station[]> {
    const rows = await this.ormRepository.find({ where: { barbershopId } });
    return rows.map((row) => StationMapper.toDomain(row));
  }

  async findById(id: string): Promise<Station | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? StationMapper.toDomain(row) : null;
  }

  async create(data: NewStation): Promise<Station> {
    const created = this.ormRepository.create(data);
    const saved = await this.ormRepository.save(created);
    return StationMapper.toDomain(saved);
  }

  async save(station: Station): Promise<Station> {
    const saved = await this.ormRepository.save(
      StationMapper.toPersistence(station),
    );
    return StationMapper.toDomain(saved);
  }
}
