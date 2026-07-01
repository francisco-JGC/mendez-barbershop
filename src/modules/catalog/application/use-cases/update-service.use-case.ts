import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SERVICE_REPOSITORY } from '../../domain/service.repository';
import type { IServiceRepository } from '../../domain/service.repository';
import { Service } from '../../domain/service.entity';
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(
    barbershopId: string,
    id: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.serviceRepository.findById(id);
    if (!service || !service.belongsToTenant(barbershopId)) {
      throw new NotFoundException('Service not found');
    }

    if (dto.name !== undefined) service.name = dto.name;
    if (dto.price !== undefined) service.price = dto.price;

    return this.serviceRepository.save(service);
  }
}
