import { Inject, Injectable } from '@nestjs/common';
import { BARBERSHOP_SETTINGS_REPOSITORY } from '../../domain/barbershop-settings.repository';
import type { IBarbershopSettingsRepository } from '../../domain/barbershop-settings.repository';
import { BarbershopSettings } from '../../domain/barbershop-settings.entity';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class UpdateSettingsUseCase {
  constructor(
    @Inject(BARBERSHOP_SETTINGS_REPOSITORY)
    private readonly repo: IBarbershopSettingsRepository,
  ) {}

  execute(
    barbershopId: string,
    dto: UpdateSettingsDto,
  ): Promise<BarbershopSettings> {
    return this.repo.update(barbershopId, {
      commissionRate:
        dto.commissionRate !== undefined
          ? dto.commissionRate.toFixed(4)
          : undefined,
      receiptFooter: dto.receiptFooter,
      logo: dto.logo,
    });
  }
}
