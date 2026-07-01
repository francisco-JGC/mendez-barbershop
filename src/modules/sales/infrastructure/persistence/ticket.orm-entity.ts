import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TicketItemOrmEntity } from './ticket-item.orm-entity';

@Entity('tickets')
@Index(['barbershopId', 'createdAt'])
@Index(['barbershopId', 'barberId', 'createdAt'])
export class TicketOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  barbershopId: string;

  @Column({ type: 'uuid', nullable: true })
  barberId: string | null;

  @Column({ type: 'uuid', nullable: true })
  stationId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: string;

  @OneToMany(() => TicketItemOrmEntity, (item) => item.ticket, {
    cascade: true,
  })
  items: TicketItemOrmEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
