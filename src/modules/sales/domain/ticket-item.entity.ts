export enum TicketItemType {
  SERVICE = 'service',
  PRODUCT = 'product',
}

export class TicketItem {
  constructor(
    public readonly id: string,
    public readonly ticketId: string,
    public readonly itemType: TicketItemType,
    public readonly itemId: string,
    public readonly quantity: number,
    public readonly unitPrice: string,
    public readonly subtotal: string,
  ) {}
}
