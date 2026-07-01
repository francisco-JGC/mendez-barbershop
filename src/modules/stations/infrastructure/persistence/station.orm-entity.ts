import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StationStatus } from '../../domain/station.entity';

@Entity('stations')
@Index(['barbershopId', 'number'], { unique: true })
export class StationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  barbershopId: string;

  @Column()
  number: number;

  @Column({
    type: 'enum',
    enum: StationStatus,
    default: StationStatus.AVAILABLE,
  })
  status: StationStatus;

  @Column({ type: 'uuid', nullable: true })
  currentBarberId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
