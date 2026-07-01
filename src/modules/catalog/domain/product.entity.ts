export class Product {
  constructor(
    public readonly id: string,
    public readonly barbershopId: string,
    public name: string,
    public barcode: string | null,
    public price: string,
    public stock: number,
    public lowStockThreshold: number,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  belongsToTenant(barbershopId: string): boolean {
    return this.barbershopId === barbershopId;
  }

  isLowStock(): boolean {
    return this.stock <= this.lowStockThreshold;
  }

  decreaseStock(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }
}
