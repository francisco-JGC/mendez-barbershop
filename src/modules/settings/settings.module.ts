import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarbershopSettingsOrmEntity } from './infrastructure/persistence/barbershop-settings.orm-entity';
import { BarbershopSettingsRepository } from './infrastructure/persistence/barbershop-settings.repository';
import { BARBERSHOP_SETTINGS_REPOSITORY } from './domain/barbershop-settings.repository';
import { SettingsController } from './infrastructure/http/settings.controller';
import { GetSettingsUseCase } from './application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from './application/use-cases/update-settings.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([BarbershopSettingsOrmEntity])],
  controllers: [SettingsController],
  providers: [
    {
      provide: BARBERSHOP_SETTINGS_REPOSITORY,
      useClass: BarbershopSettingsRepository,
    },
    GetSettingsUseCase,
    UpdateSettingsUseCase,
  ],
  exports: [BARBERSHOP_SETTINGS_REPOSITORY],
})
export class SettingsModule {}
