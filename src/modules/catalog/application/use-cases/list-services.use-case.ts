import { Inject, Injectable } from '@nestjs/common';
import { SERVICE_REPOSITORY } from '../../domain/service.repository';
import type { IServiceRepository } from '../../domain/service.repository';
import { Service } from '../../domain/service.entity';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  execute(barbershopId: string): Promise<Service[]> {
    return this.serviceRepository.findAllByTenant(barbershopId);
  }
}
