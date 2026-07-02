import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BARBERSHOP_REPOSITORY } from '../../domain/barbershop.repository';
import type { IBarbershopRepository } from '../../domain/barbershop.repository';
import { BARBERSHOP_SETTINGS_REPOSITORY } from '../../../settings/domain/barbershop-settings.repository';
import type { IBarbershopSettingsRepository } from '../../../settings/domain/barbershop-settings.repository';

export interface BarbershopLookup {
  name: string;
  logo: string | null;
  isActive: boolean;
}

@Injectable()
export class LookupBarbershopUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
    @Inject(BARBERSHOP_SETTINGS_REPOSITORY)
    private readonly settingsRepository: IBarbershopSettingsRepository,
  ) {}

  async execute(code: string): Promise<BarbershopLookup> {
    const barbershop = await this.barbershopRepository.findByCode(
      code.toLowerCase(),
    );
    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const settings = await this.settingsRepository.findByBarbershopId(
      barbershop.id,
    );

    return {
      name: barbershop.name,
      logo: settings?.logo ?? null,
      isActive: barbershop.isActive,
    };
  }
}
