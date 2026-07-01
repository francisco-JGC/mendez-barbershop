import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TICKET_REPOSITORY } from '../../domain/ticket.repository';
import type {
  CreateTicketItemInput,
  ITicketRepository,
} from '../../domain/ticket.repository';
import { Ticket } from '../../domain/ticket.entity';
import { TicketItemType } from '../../domain/ticket-item.entity';
import { SERVICE_REPOSITORY } from '../../../catalog/domain/service.repository';
import type { IServiceRepository } from '../../../catalog/domain/service.repository';
import { PRODUCT_REPOSITORY } from '../../../catalog/domain/product.repository';
import type { IProductRepository } from '../../../catalog/domain/product.repository';
import { STATION_REPOSITORY } from '../../../stations/domain/station.repository';
import type { IStationRepository } from '../../../stations/domain/station.repository';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { CreateTicketDto } from '../dto/create-ticket.dto';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(STATION_REPOSITORY)
    private readonly stationRepository: IStationRepository,
  ) {}

  async execute(
    currentUser: AuthenticatedUser,
    dto: CreateTicketDto,
  ): Promise<Ticket> {
    const barbershopId = currentUser.barbershopId!;
    const barberId = this.resolveBarberId(currentUser, dto.barberId);

    const serviceIds = dto.items
      .filter((item) => item.itemType === TicketItemType.SERVICE)
      .map((item) => item.itemId);
    const productIds = dto.items
      .filter((item) => item.itemType === TicketItemType.PRODUCT)
      .map((item) => item.itemId);

    const [services, products, station] = await Promise.all([
      this.serviceRepository.findByIds(barbershopId, serviceIds),
      this.productRepository.findByIds(barbershopId, productIds),
      this.stationRepository.findByCurrentBarberId(barbershopId, barberId),
    ]);

    const { items, total } = this.priceTicketItems(
      dto.items,
      services,
      products,
    );

    if (items.length === 0) {
      throw new BadRequestException('A ticket must have at least one item');
    }

    return this.ticketRepository.create({
      barbershopId,
      barberId,
      // The barber's station at the moment of the sale, recorded as a
      // snapshot: if the barber's station assignment changes later, past
      // tickets must keep reflecting where the sale actually happened.
      stationId: station?.id ?? null,
      total: total.toFixed(2),
      items,
    });
  }

  private priceTicketItems(
    requestedItems: CreateTicketDto['items'],
    services: Array<{ id: string; price: string }>,
    products: Array<{ id: string; price: string }>,
  ): { items: CreateTicketItemInput[]; total: number } {
    const servicesById = new Map(services.map((s) => [s.id, s]));
    const productsById = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const items = requestedItems.map((item) => {
      const catalogItem =
        item.itemType === TicketItemType.SERVICE
          ? servicesById.get(item.itemId)
          : productsById.get(item.itemId);

      if (!catalogItem) {
        throw new NotFoundException(
          `${item.itemType} ${item.itemId} not found in this barbershop`,
        );
      }

      const unitPrice = Number(catalogItem.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      return {
        itemType: item.itemType,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
      };
    });

    return { items, total };
  }

  private resolveBarberId(
    currentUser: AuthenticatedUser,
    requestedBarberId?: string,
  ): string {
    if (currentUser.role === Role.BARBER) {
      return currentUser.userId;
    }

    if (!requestedBarberId) {
      throw new BadRequestException('barberId is required for this role');
    }

    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Not allowed to create tickets');
    }

    return requestedBarberId;
  }
}
