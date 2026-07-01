import { Inject, Injectable } from '@nestjs/common';
import { SERVICE_REPOSITORY } from '../../domain/service.repository';
import type { IServiceRepository } from '../../domain/service.repository';
import { Service } from '../../domain/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  execute(barbershopId: string, dto: CreateServiceDto): Promise<Service> {
    return this.serviceRepository.create({
      barbershopId,
      name: dto.name,
      price: dto.price,
    });
  }
}
