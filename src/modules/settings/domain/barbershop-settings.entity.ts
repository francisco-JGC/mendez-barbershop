export class BarbershopSettings {
  constructor(
    public readonly barbershopId: string,
    public commissionRate: string,
    public receiptFooter: string,
    public logo: string | null,
    public printBarbershopName: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
