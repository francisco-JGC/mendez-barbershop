import { Inject, Injectable } from '@nestjs/common';
import { BARBERSHOP_REPOSITORY } from '../../domain/barbershop.repository';
import type { IBarbershopRepository } from '../../domain/barbershop.repository';
import { Barbershop } from '../../domain/barbershop.entity';

@Injectable()
export class ListBarbershopsUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
  ) {}

  execute(): Promise<Barbershop[]> {
    return this.barbershopRepository.findAll();
  }
}
