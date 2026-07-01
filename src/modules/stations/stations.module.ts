import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { StationOrmEntity } from './infrastructure/persistence/station.orm-entity';
import { StationRepository } from './infrastructure/persistence/station.repository';
import { STATION_REPOSITORY } from './domain/station.repository';
import { StationsController } from './infrastructure/http/stations.controller';
import { CreateStationUseCase } from './application/use-cases/create-station.use-case';
import { ListStationsUseCase } from './application/use-cases/list-stations.use-case';
import { AssignBarberUseCase } from './application/use-cases/assign-barber.use-case';
import { ReleaseStationUseCase } from './application/use-cases/release-station.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([StationOrmEntity]), UsersModule],
  controllers: [StationsController],
  providers: [
    { provide: STATION_REPOSITORY, useClass: StationRepository },
    CreateStationUseCase,
    ListStationsUseCase,
    AssignBarberUseCase,
    ReleaseStationUseCase,
  ],
  exports: [STATION_REPOSITORY],
})
export class StationsModule {}
