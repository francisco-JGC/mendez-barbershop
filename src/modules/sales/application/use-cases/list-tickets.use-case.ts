import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { TICKET_REPOSITORY } from '../../domain/ticket.repository';
import type {
  ITicketRepository,
  PaginatedTickets,
} from '../../domain/ticket.repository';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';

@Injectable()
export class ListTicketsUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  execute(
    currentUser: AuthenticatedUser,
    barbershopId: string,
    page = 1,
    limit = 20,
    barberId?: string,
  ): Promise<PaginatedTickets> {
    const pagination = { skip: (page - 1) * limit, take: limit };

    if (currentUser.role === Role.ADMIN || currentUser.role === Role.SELLER) {
      if (barberId) {
        return this.ticketRepository.findAllByBarber(
          barbershopId,
          barberId,
          pagination,
        );
      }
      return this.ticketRepository.findAllByTenant(barbershopId, pagination);
    }

    if (currentUser.role === Role.BARBER) {
      return this.ticketRepository.findAllByBarber(
        barbershopId,
        currentUser.userId,
        pagination,
      );
    }

    throw new ForbiddenException('Not allowed to list tickets');
  }
}
