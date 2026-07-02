import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { BarbershopOrmEntity } from './infrastructure/persistence/barbershop.orm-entity';
import { BarbershopRepository } from './infrastructure/persistence/barbershop.repository';
import { BARBERSHOP_REPOSITORY } from './domain/barbershop.repository';
import { TenantsController } from './infrastructure/http/tenants.controller';
import { CreateBarbershopUseCase } from './application/use-cases/create-barbershop.use-case';
import { ListBarbershopsUseCase } from './application/use-cases/list-barbershops.use-case';
import { SetBarbershopActiveUseCase } from './application/use-cases/set-barbershop-active.use-case';
import { CreateBarbershopAdminUseCase } from './application/use-cases/create-barbershop-admin.use-case';
import { UpdateBarbershopUseCase } from './application/use-cases/update-barbershop.use-case';
import { GetCurrentBarbershopUseCase } from './application/use-cases/get-current-barbershop.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([BarbershopOrmEntity]), UsersModule],
  controllers: [TenantsController],
  providers: [
    { provide: BARBERSHOP_REPOSITORY, useClass: BarbershopRepository },
    CreateBarbershopUseCase,
    ListBarbershopsUseCase,
    SetBarbershopActiveUseCase,
    CreateBarbershopAdminUseCase,
    UpdateBarbershopUseCase,
    GetCurrentBarbershopUseCase,
  ],
  exports: [BARBERSHOP_REPOSITORY],
})
export class TenantsModule {}
