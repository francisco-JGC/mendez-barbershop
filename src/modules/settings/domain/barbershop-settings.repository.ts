import { BarbershopSettings } from './barbershop-settings.entity';

export const BARBERSHOP_SETTINGS_REPOSITORY = Symbol('BARBERSHOP_SETTINGS_REPOSITORY');

export interface UpdateBarbershopSettings {
  commissionRate?: string;
  receiptFooter?: string;
  logo?: string | null;
}

export interface IBarbershopSettingsRepository {
  findByBarbershopId(barbershopId: string): Promise<BarbershopSettings | null>;
  /** Creates the row with defaults if it doesn't exist yet, then returns it. */
  findOrCreate(barbershopId: string): Promise<BarbershopSettings>;
  update(
    barbershopId: string,
    changes: UpdateBarbershopSettings,
  ): Promise<BarbershopSettings>;
}
