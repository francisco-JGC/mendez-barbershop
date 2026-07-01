import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminDashboardSummary,
  BarberRankingEntry,
  IDashboardQueryService,
  LowStockProductEntry,
  ServiceBreakdownEntry,
} from '../application/ports/dashboard-query.service';
import { TicketOrmEntity } from '../../sales/infrastructure/persistence/ticket.orm-entity';
import { TicketItemOrmEntity } from '../../sales/infrastructure/persistence/ticket-item.orm-entity';
import { ProductOrmEntity } from '../../catalog/infrastructure/persistence/product.orm-entity';
import { ServiceOrmEntity } from '../../catalog/infrastructure/persistence/service.orm-entity';
import { UserOrmEntity } from '../../users/infrastructure/persistence/user.orm-entity';
import { StationOrmEntity } from '../../stations/infrastructure/persistence/station.orm-entity';
import { TicketItemType } from '../../sales/domain/ticket-item.entity';
import { BARBER_COMMISSION_RATE } from '../../../common/constants/commission';

@Injectable()
export class TypeOrmDashboardQueryService implements IDashboardQueryService {
  constructor(
    @InjectRepository(TicketOrmEntity)
    private readonly ticketRepo: Repository<TicketOrmEntity>,
    @InjectRepository(TicketItemOrmEntity)
    private readonly ticketItemRepo: Repository<TicketItemOrmEntity>,
    @InjectRepository(ProductOrmEntity)
    private readonly productRepo: Repository<ProductOrmEntity>,
    @InjectRepository(StationOrmEntity)
    private readonly stationRepo: Repository<StationOrmEntity>,
  ) {}

  async getAdminSummary(
    barbershopId: string,
    from: Date,
    to: Date,
  ): Promise<AdminDashboardSummary> {
    const [
      servicesRevenue,
      productsRevenue,
      barberRanking,
      serviceBreakdown,
      lowStockProducts,
    ] = await Promise.all([
      this.sumByItemType(barbershopId, from, to, TicketItemType.SERVICE),
      this.sumByItemType(barbershopId, from, to, TicketItemType.PRODUCT),
      this.getBarberRanking(barbershopId, from, to),
      this.getServiceBreakdown(barbershopId, from, to),
      this.getLowStockProducts(barbershopId),
    ]);

    const totalCommissions = barberRanking.reduce(
      (sum, entry) => sum + Number(entry.commission),
      0,
    );

    return {
      servicesRevenue: servicesRevenue.toFixed(2),
      productsRevenue: productsRevenue.toFixed(2),
      totalRevenue: (servicesRevenue + productsRevenue).toFixed(2),
      totalCommissions: totalCommissions.toFixed(2),
      barberRanking,
      serviceBreakdown,
      lowStockProducts,
    };
  }

  async getBarberSummary(
    barbershopId: string,
    barberId: string,
    from: Date,
    to: Date,
  ) {
    // A barber's revenue only reflects the services they performed —
    // product sales rung up under their name (eg. a walk-in retail sale)
    // don't count toward their personal stats.
    const [row, serviceBreakdown, station] = await Promise.all([
      this.ticketItemRepo
        .createQueryBuilder('item')
        .innerJoin('item.ticket', 'ticket')
        .select('COUNT(*)', 'cutsCount')
        .addSelect('COALESCE(SUM(item.subtotal), 0)', 'revenue')
        .where('ticket.barbershopId = :barbershopId', { barbershopId })
        .andWhere('ticket.barberId = :barberId', { barberId })
        .andWhere('item.itemType = :itemType', {
          itemType: TicketItemType.SERVICE,
        })
        .andWhere('ticket.createdAt BETWEEN :from AND :to', { from, to })
        .getRawOne<{ cutsCount: string; revenue: string }>(),
      this.getServiceBreakdown(barbershopId, from, to, barberId),
      this.stationRepo.findOne({
        where: { barbershopId, currentBarberId: barberId },
      }),
    ]);

    const totalRevenue = Number(row?.revenue ?? 0);
    return {
      cutsCount: Number(row?.cutsCount ?? 0),
      totalRevenue: totalRevenue.toFixed(2),
      commission: (totalRevenue * BARBER_COMMISSION_RATE).toFixed(2),
      stationNumber: station?.number ?? null,
      serviceBreakdown,
    };
  }

  private async sumByItemType(
    barbershopId: string,
    from: Date,
    to: Date,
    itemType: TicketItemType,
  ): Promise<number> {
    const row = await this.ticketItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.ticket', 'ticket')
      .select('COALESCE(SUM(item.subtotal), 0)', 'total')
      .where('ticket.barbershopId = :barbershopId', { barbershopId })
      .andWhere('item.itemType = :itemType', { itemType })
      .andWhere('ticket.createdAt BETWEEN :from AND :to', { from, to })
      .getRawOne<{ total: string }>();

    return Number(row?.total ?? 0);
  }

  private async getBarberRanking(
    barbershopId: string,
    from: Date,
    to: Date,
  ): Promise<BarberRankingEntry[]> {
    // Ranking is based on services performed, not on product sales that
    // happened to be rung up under a barber's ticket.
    const rows = await this.ticketItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.ticket', 'ticket')
      .innerJoin(UserOrmEntity, 'barber', 'barber.id = ticket.barberId')
      .select('ticket.barberId', 'barberId')
      .addSelect('barber.name', 'barberName')
      .addSelect('COUNT(*)', 'cutsCount')
      .addSelect('SUM(item.subtotal)', 'revenue')
      .where('ticket.barbershopId = :barbershopId', { barbershopId })
      .andWhere('item.itemType = :itemType', {
        itemType: TicketItemType.SERVICE,
      })
      .andWhere('ticket.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('ticket.barberId')
      .addGroupBy('barber.name')
      .orderBy('revenue', 'DESC')
      .getRawMany<{
        barberId: string;
        barberName: string;
        cutsCount: string;
        revenue: string;
      }>();

    return rows.map((row) => {
      const revenue = Number(row.revenue);
      return {
        barberId: row.barberId,
        barberName: row.barberName,
        cutsCount: Number(row.cutsCount),
        revenue: revenue.toFixed(2),
        commission: (revenue * BARBER_COMMISSION_RATE).toFixed(2),
      };
    });
  }

  private async getServiceBreakdown(
    barbershopId: string,
    from: Date,
    to: Date,
    barberId?: string,
  ): Promise<ServiceBreakdownEntry[]> {
    const query = this.ticketItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.ticket', 'ticket')
      .innerJoin(ServiceOrmEntity, 'service', 'service.id = item.itemId')
      .select('item.itemId', 'serviceId')
      .addSelect('service.name', 'serviceName')
      .addSelect('SUM(item.quantity)', 'count')
      .where('ticket.barbershopId = :barbershopId', { barbershopId })
      .andWhere('item.itemType = :itemType', {
        itemType: TicketItemType.SERVICE,
      })
      .andWhere('ticket.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('item.itemId')
      .addGroupBy('service.name')
      .orderBy('count', 'DESC');

    if (barberId) {
      query.andWhere('ticket.barberId = :barberId', { barberId });
    }

    const rows = await query.getRawMany<{
      serviceId: string;
      serviceName: string;
      count: string;
    }>();

    return rows.map((row) => ({
      serviceId: row.serviceId,
      serviceName: row.serviceName,
      count: Number(row.count),
    }));
  }

  private async getLowStockProducts(
    barbershopId: string,
  ): Promise<LowStockProductEntry[]> {
    const rows = await this.productRepo
      .createQueryBuilder('product')
      .where('product.barbershopId = :barbershopId', { barbershopId })
      .andWhere('product.stock <= product.lowStockThreshold')
      .getMany();

    return rows.map((row) => ({
      productId: row.id,
      name: row.name,
      stock: row.stock,
      lowStockThreshold: row.lowStockThreshold,
    }));
  }
}
