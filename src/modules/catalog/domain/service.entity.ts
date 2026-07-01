export class Service {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public name: string,
    public price: string,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  belongsToTenant(barbershopId: string): boolean {
    return this.barbershopId === barbershopId;
  }
}
