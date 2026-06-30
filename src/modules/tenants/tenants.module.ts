import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarbershopOrmEntity } from './infrastructure/persistence/barbershop.orm-entity';
import { BarbershopRepository } from './infrastructure/persistence/barbershop.repository';
import { BARBERSHOP_REPOSITORY } from './domain/barbershop.repository';
import { TenantsController } from './infrastructure/http/tenants.controller';
import { CreateBarbershopUseCase } from './application/use-cases/create-barbershop.use-case';
import { ListBarbershopsUseCase } from './application/use-cases/list-barbershops.use-case';
import { SetBarbershopActiveUseCase } from './application/use-cases/set-barbershop-active.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([BarbershopOrmEntity])],
  controllers: [TenantsController],
  providers: [
    { provide: BARBERSHOP_REPOSITORY, useClass: BarbershopRepository },
    CreateBarbershopUseCase,
    ListBarbershopsUseCase,
    SetBarbershopActiveUseCase,
  ],
  exports: [BARBERSHOP_REPOSITORY],
})
export class TenantsModule {}
