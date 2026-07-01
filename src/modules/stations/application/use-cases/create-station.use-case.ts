import { Inject, Injectable } from '@nestjs/common';
import { STATION_REPOSITORY } from '../../domain/station.repository';
import type { IStationRepository } from '../../domain/station.repository';
import { Station } from '../../domain/station.entity';
import { CreateStationDto } from '../dto/create-station.dto';

@Injectable()
export class CreateStationUseCase {
  constructor(
    @Inject(STATION_REPOSITORY)
    private readonly stationRepository: IStationRepository,
  ) {}

  execute(barbershopId: string, dto: CreateStationDto): Promise<Station> {
    return this.stationRepository.create({
      barbershopId,
      number: dto.number,
    });
  }
}
