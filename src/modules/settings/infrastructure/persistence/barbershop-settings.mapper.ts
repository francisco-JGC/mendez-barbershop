import { BarbershopSettings } from '../../domain/barbershop-settings.entity';
import { BarbershopSettingsOrmEntity } from './barbershop-settings.orm-entity';

export class BarbershopSettingsMapper {
  static toDomain(orm: BarbershopSettingsOrmEntity): BarbershopSettings {
    return new BarbershopSettings(
      orm.barbershopId,
      orm.commissionRate,
      orm.receiptFooter,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
