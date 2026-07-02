import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('barbershop_settings')
export class BarbershopSettingsOrmEntity {
  // 1:1 with barbershops — the barbershop id is the PK, keeping the model
  // small and making it impossible to have two settings rows for one tenant.
  @PrimaryColumn({ type: 'uuid' })
  barbershopId: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.5 })
  commissionRate: string;

  @Column({ type: 'varchar', length: 200, default: 'Gracias por su visita' })
  receiptFooter: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
