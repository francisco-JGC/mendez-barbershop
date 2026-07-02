import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BARBERSHOP_REPOSITORY } from '../../domain/barbershop.repository';
import type { IBarbershopRepository } from '../../domain/barbershop.repository';
import { Barbershop } from '../../domain/barbershop.entity';
import { UpdateBarbershopDto } from '../dto/update-barbershop.dto';

@Injectable()
export class UpdateBarbershopUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
  ) {}

  async execute(id: string, dto: UpdateBarbershopDto): Promise<Barbershop> {
    const barbershop = await this.barbershopRepository.findById(id);
    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }
    if (dto.name) {
      barbershop.name = dto.name;
    }
    return this.barbershopRepository.save(barbershop);
  }
}
