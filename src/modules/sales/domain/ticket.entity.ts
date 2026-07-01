import { TicketItem } from './ticket-item.entity';

export class Ticket {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public readonly barberId: string,
    public readonly stationId: string | null,
    public readonly total: string,
    public readonly items: TicketItem[],
    public readonly createdAt: Date,
  ) {}

  belongsToTenant(barbershopId: string): boolean {
    return this.barbershopId === barbershopId;
  }
}
