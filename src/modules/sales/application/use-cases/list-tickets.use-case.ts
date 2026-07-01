import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { TICKET_REPOSITORY } from '../../domain/ticket.repository';
import type { ITicketRepository } from '../../domain/ticket.repository';
import { Ticket } from '../../domain/ticket.entity';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';

@Injectable()
export class ListTicketsUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  execute(currentUser: AuthenticatedUser): Promise<Ticket[]> {
    const barbershopId = currentUser.barbershopId!;

    if (currentUser.role === Role.ADMIN) {
      return this.ticketRepository.findAllByTenant(barbershopId);
    }

    if (currentUser.role === Role.BARBER) {
      return this.ticketRepository.findAllByBarber(
        barbershopId,
        currentUser.userId,
      );
    }

    throw new ForbiddenException('Not allowed to list tickets');
  }
}
