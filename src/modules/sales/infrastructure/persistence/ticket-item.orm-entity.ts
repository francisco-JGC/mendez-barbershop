import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TicketItemType } from '../../domain/ticket-item.entity';
import { TicketOrmEntity } from './ticket.orm-entity';

@Entity('ticket_items')
export class TicketItemOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => TicketOrmEntity, (ticket) => ticket.items, {
    onDelete: 'CASCADE',
  })
  ticket: TicketOrmEntity;

  @Column({ type: 'enum', enum: TicketItemType })
  itemType: TicketItemType;

  @Column({ type: 'uuid' })
  itemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: string;
}
