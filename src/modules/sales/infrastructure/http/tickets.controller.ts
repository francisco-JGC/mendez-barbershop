import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ResolvedTenantId } from '../../../../common/decorators/resolved-tenant-id.decorator';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { CreateTicketUseCase } from '../../application/use-cases/create-ticket.use-case';
import { ListTicketsUseCase } from '../../application/use-cases/list-tickets.use-case';
import { CreateTicketDto } from '../../application/dto/create-ticket.dto';
import { ListTicketsQueryDto } from '../../application/dto/list-tickets-query.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SELLER)
export class TicketsController {
  constructor(
    private readonly createTicket: CreateTicketUseCase,
    private readonly listTickets: ListTicketsUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @ResolvedTenantId() barbershopId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.createTicket.execute(user, barbershopId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @ResolvedTenantId() barbershopId: string,
    @Query() query: ListTicketsQueryDto,
  ) {
    return this.listTickets.execute(
      user,
      barbershopId,
      query.page,
      query.limit,
      query.barberId,
    );
  }
}
