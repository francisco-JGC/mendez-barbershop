import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { STATION_REPOSITORY } from '../../domain/station.repository';
import type { IStationRepository } from '../../domain/station.repository';
import { Station } from '../../domain/station.entity';
import { USER_REPOSITORY } from '../../../users/domain/user.repository';
import type { IUserRepository } from '../../../users/domain/user.repository';

@Injectable()
export class AssignBarberUseCase {
  constructor(
    @Inject(STATION_REPOSITORY)
    private readonly stationRepository: IStationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    barbershopId: string,
    stationId: string,
    barberId: string,
  ): Promise<Station> {
    const station = await this.stationRepository.findById(stationId);
    if (!station || !station.belongsToTenant(barbershopId)) {
      throw new NotFoundException('Station not found');
    }

    const barber = await this.userRepository.findById(barberId);
    if (!barber || !barber.belongsToTenant(barbershopId) || !barber.isActive) {
      throw new NotFoundException('Barber not found');
    }

    if (station.currentBarberId && station.currentBarberId !== barberId) {
      throw new ConflictException('Station is already occupied');
    }

    const barberCurrentStation =
      await this.stationRepository.findByCurrentBarberId(
        barbershopId,
        barberId,
      );
    if (barberCurrentStation && barberCurrentStation.id !== stationId) {
      throw new ConflictException(
        'This barber is already assigned to another station',
      );
    }

    station.assignBarber(barberId);
    return this.stationRepository.save(station);
  }
}
