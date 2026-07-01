import { Inject, Injectable } from '@nestjs/common';
import { STATION_REPOSITORY } from '../../domain/station.repository';
import type { IStationRepository } from '../../domain/station.repository';
import { Station } from '../../domain/station.entity';

@Injectable()
export class ListStationsUseCase {
  constructor(
    @Inject(STATION_REPOSITORY)
    private readonly stationRepository: IStationRepository,
  ) {}

  execute(barbershopId: string): Promise<Station[]> {
    return this.stationRepository.findAllByTenant(barbershopId);
  }
}
