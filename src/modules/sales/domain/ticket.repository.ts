import { Ticket } from './ticket.entity';
import { TicketItemType } from './ticket-item.entity';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface CreateTicketItemInput {
  itemType: TicketItemType;
  itemId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

export interface CreateTicketInput {
  barbershopId: string;
  barberId: string;
  stationId: string | null;
  total: string;
  items: CreateTicketItemInput[];
}

export interface TicketDateRange {
  from?: Date;
  to?: Date;
}

export interface ITicketRepository {
  /**
   * Persists the ticket and its items, decrementing product stock atomically
   * in the same transaction (locks the affected product rows to avoid
   * overselling under concurrent checkouts).
   */
  create(input: CreateTicketInput): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  findAllByTenant(
    barbershopId: string,
    range?: TicketDateRange,
  ): Promise<Ticket[]>;
  findAllByBarber(
    barbershopId: string,
    barberId: string,
    range?: TicketDateRange,
  ): Promise<Ticket[]>;
}
