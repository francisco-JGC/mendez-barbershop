import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from '../catalog/catalog.module';
import { StationsModule } from '../stations/stations.module';
import { TicketOrmEntity } from './infrastructure/persistence/ticket.orm-entity';
import { TicketItemOrmEntity } from './infrastructure/persistence/ticket-item.orm-entity';
import { TicketRepository } from './infrastructure/persistence/ticket.repository';
import { TICKET_REPOSITORY } from './domain/ticket.repository';
import { TicketsController } from './infrastructure/http/tickets.controller';
import { CreateTicketUseCase } from './application/use-cases/create-ticket.use-case';
import { ListTicketsUseCase } from './application/use-cases/list-tickets.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketOrmEntity, TicketItemOrmEntity]),
    CatalogModule,
    StationsModule,
  ],
  controllers: [TicketsController],
  providers: [
    { provide: TICKET_REPOSITORY, useClass: TicketRepository },
    CreateTicketUseCase,
    ListTicketsUseCase,
  ],
  exports: [TICKET_REPOSITORY],
})
export class SalesModule {}
