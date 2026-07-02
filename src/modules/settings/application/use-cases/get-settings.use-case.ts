import { Inject, Injectable } from '@nestjs/common';
import { BARBERSHOP_SETTINGS_REPOSITORY } from '../../domain/barbershop-settings.repository';
import type { IBarbershopSettingsRepository } from '../../domain/barbershop-settings.repository';
import { BarbershopSettings } from '../../domain/barbershop-settings.entity';

@Injectable()
export class GetSettingsUseCase {
  constructor(
    @Inject(BARBERSHOP_SETTINGS_REPOSITORY)
    private readonly repo: IBarbershopSettingsRepository,
  ) {}

  execute(barbershopId: string): Promise<BarbershopSettings> {
    return this.repo.findOrCreate(barbershopId);
  }
}
