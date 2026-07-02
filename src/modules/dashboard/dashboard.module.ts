import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketOrmEntity } from '../sales/infrastructure/persistence/ticket.orm-entity';
import { TicketItemOrmEntity } from '../sales/infrastructure/persistence/ticket-item.orm-entity';
import { ProductOrmEntity } from '../catalog/infrastructure/persistence/product.orm-entity';
import { ServiceOrmEntity } from '../catalog/infrastructure/persistence/service.orm-entity';
import { UserOrmEntity } from '../users/infrastructure/persistence/user.orm-entity';
import { StationOrmEntity } from '../stations/infrastructure/persistence/station.orm-entity';
import { DASHBOARD_QUERY_SERVICE } from './application/ports/dashboard-query.service';
import { TypeOrmDashboardQueryService } from './infrastructure/typeorm-dashboard-query.service';
import { DashboardController } from './infrastructure/http/dashboard.controller';
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard.use-case';
import { GetBarberDashboardUseCase } from './application/use-cases/get-barber-dashboard.use-case';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketOrmEntity,
      TicketItemOrmEntity,
      ProductOrmEntity,
      ServiceOrmEntity,
      UserOrmEntity,
      StationOrmEntity,
    ]),
    SettingsModule,
  ],
  controllers: [DashboardController],
  providers: [
    {
      provide: DASHBOARD_QUERY_SERVICE,
      useClass: TypeOrmDashboardQueryService,
    },
    GetAdminDashboardUseCase,
    GetBarberDashboardUseCase,
  ],
})
export class DashboardModule {}
