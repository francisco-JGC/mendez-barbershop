export enum StationStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
}

export class Station {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public number: number,
    public status: StationStatus,
    public currentBarberId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  belongsToTenant(barbershopId: string): boolean {
    return this.barbershopId === barbershopId;
  }

  assignBarber(barberId: string): void {
    this.currentBarberId = barberId;
    this.status = StationStatus.OCCUPIED;
  }

  release(): void {
    this.currentBarberId = null;
    this.status = StationStatus.AVAILABLE;
  }
}
