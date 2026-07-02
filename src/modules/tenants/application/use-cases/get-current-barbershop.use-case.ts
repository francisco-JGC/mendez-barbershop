import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BARBERSHOP_REPOSITORY } from '../../domain/barbershop.repository';
import type { IBarbershopRepository } from '../../domain/barbershop.repository';
import { Barbershop } from '../../domain/barbershop.entity';

@Injectable()
export class GetCurrentBarbershopUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
  ) {}

  async execute(id: string): Promise<Barbershop> {
    const barbershop = await this.barbershopRepository.findById(id);
    if (!barbershop) {
      throw new NotFoundException('Barbershop not found');
    }
    return barbershop;
  }
}
