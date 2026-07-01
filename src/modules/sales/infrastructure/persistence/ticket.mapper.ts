import { Ticket } from '../../domain/ticket.entity';
import { TicketItem } from '../../domain/ticket-item.entity';
import { TicketOrmEntity } from './ticket.orm-entity';
import { TicketItemOrmEntity } from './ticket-item.orm-entity';

export class TicketMapper {
  static toDomain(orm: TicketOrmEntity): Ticket {
    return new Ticket(
      orm.id,
      orm.barbershopId,
      orm.barberId,
      orm.stationId,
      orm.total,
      (orm.items ?? []).map((item) => this.itemToDomain(item)),
      orm.createdAt,
    );
  }

  static itemToDomain(orm: TicketItemOrmEntity): TicketItem {
    return new TicketItem(
      orm.id,
      orm.ticketId,
      orm.itemType,
      orm.itemId,
      orm.quantity,
      orm.unitPrice,
      orm.subtotal,
    );
  }
}
