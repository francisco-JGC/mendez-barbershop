import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { STATION_REPOSITORY } from '../../domain/station.repository';
import type { IStationRepository } from '../../domain/station.repository';
import { Station } from '../../domain/station.entity';

@Injectable()
export class ReleaseStationUseCase {
  constructor(
    @Inject(STATION_REPOSITORY)
    private readonly stationRepository: IStationRepository,
  ) {}

  async execute(barbershopId: string, stationId: string): Promise<Station> {
    const station = await this.stationRepository.findById(stationId);
    if (!station || !station.belongsToTenant(barbershopId)) {
      throw new NotFoundException('Station not found');
    }

    station.release();
    return this.stationRepository.save(station);
  }
}
