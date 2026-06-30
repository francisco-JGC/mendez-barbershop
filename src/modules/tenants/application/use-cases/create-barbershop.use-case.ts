import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { BARBERSHOP_REPOSITORY } from '../../domain/barbershop.repository';
import type { IBarbershopRepository } from '../../domain/barbershop.repository';
import { Barbershop } from '../../domain/barbershop.entity';
import { CreateBarbershopDto } from '../dto/create-barbershop.dto';

@Injectable()
export class CreateBarbershopUseCase {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
  ) {}

  async execute(dto: CreateBarbershopDto): Promise<Barbershop> {
    const existing = await this.barbershopRepository.findBySubdomain(
      dto.subdomain,
    );
    if (existing) {
      throw new ConflictException('Subdomain already in use');
    }

    return this.barbershopRepository.create({
      name: dto.name,
      subdomain: dto.subdomain,
    });
  }
}
