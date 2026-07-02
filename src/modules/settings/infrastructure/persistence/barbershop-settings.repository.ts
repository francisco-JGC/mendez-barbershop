import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IBarbershopSettingsRepository,
  UpdateBarbershopSettings,
} from '../../domain/barbershop-settings.repository';
import { BarbershopSettings } from '../../domain/barbershop-settings.entity';
import { BarbershopSettingsOrmEntity } from './barbershop-settings.orm-entity';
import { BarbershopSettingsMapper } from './barbershop-settings.mapper';

@Injectable()
export class BarbershopSettingsRepository
  implements IBarbershopSettingsRepository
{
  constructor(
    @InjectRepository(BarbershopSettingsOrmEntity)
    private readonly ormRepository: Repository<BarbershopSettingsOrmEntity>,
  ) {}

  async findByBarbershopId(
    barbershopId: string,
  ): Promise<BarbershopSettings | null> {
    const row = await this.ormRepository.findOne({ where: { barbershopId } });
    return row ? BarbershopSettingsMapper.toDomain(row) : null;
  }

  async findOrCreate(barbershopId: string): Promise<BarbershopSettings> {
    const existing = await this.ormRepository.findOne({ where: { barbershopId } });
    if (existing) return BarbershopSettingsMapper.toDomain(existing);

    const created = this.ormRepository.create({ barbershopId });
    const saved = await this.ormRepository.save(created);
    return BarbershopSettingsMapper.toDomain(saved);
  }

  async update(
    barbershopId: string,
    changes: UpdateBarbershopSettings,
  ): Promise<BarbershopSettings> {
    // Rely on findOrCreate so callers can update without having to precreate
    // the row — the first admin who opens the settings page seeds it.
    await this.findOrCreate(barbershopId);
    await this.ormRepository.update({ barbershopId }, changes);
    const row = await this.ormRepository.findOneOrFail({ where: { barbershopId } });
    return BarbershopSettingsMapper.toDomain(row);
  }
}
