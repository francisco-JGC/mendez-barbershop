import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminDashboardSummary,
  BarberRankingEntry,
  IDashboardQueryService,
  LowStockProductEntry,
  TopServiceEntry,
} from '../application/ports/dashboard-query.service';
import { TicketOrmEntity } from '../../sales/infrastructure/persistence/ticket.orm-entity';
import { TicketItemOrmEntity } from '../../sales/infrastructure/persistence/ticket-item.orm-entity';
import { ProductOrmEntity } from '../../catalog/infrastructure/persistence/product.orm-entity';
import { ServiceOrmEntity } from '../../catalog/infrastructure/persistence/service.orm-entity';
import { UserOrmEntity } from '../../users/infrastructure/persistence/user.orm-entity';
import { StationOrmEntity } from '../../stations/infrastructure/persistence/station.orm-entity';
import { TicketItemType } from '../../sales/domain/ticket-item.entity';

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
      topService,
      lowStockProducts,
    ] = await Promise.all([
      this.sumByItemType(barbershopId, from, to, TicketItemType.SERVICE),
      this.sumByItemType(barbershopId, from, to, TicketItemType.PRODUCT),
      this.getBarberRanking(barbershopId, from, to),
      this.getTopService(barbershopId, from, to),
      this.getLowStockProducts(barbershopId),
    ]);

    return {
      servicesRevenue: servicesRevenue.toFixed(2),
      productsRevenue: productsRevenue.toFixed(2),
      totalRevenue: (servicesRevenue + productsRevenue).toFixed(2),
      barberRanking,
      topService,
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
    const row = await this.ticketItemRepo
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
      .getRawOne<{ cutsCount: string; revenue: string }>();

    const station = await this.stationRepo.findOne({
      where: { barbershopId, currentBarberId: barberId },
    });

    return {
      cutsCount: Number(row?.cutsCount ?? 0),
      totalRevenue: Number(row?.revenue ?? 0).toFixed(2),
      stationNumber: station?.number ?? null,
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
      .addSelect('SUM(item.subtotal)', 'revenue')
      .where('ticket.barbershopId = :barbershopId', { barbershopId })
      .andWhere('item.itemType = :itemType', {
        itemType: TicketItemType.SERVICE,
      })
      .andWhere('ticket.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('ticket.barberId')
      .addGroupBy('barber.name')
      .orderBy('revenue', 'DESC')
      .getRawMany<{ barberId: string; barberName: string; revenue: string }>();

    return rows.map((row) => ({
      barberId: row.barberId,
      barberName: row.barberName,
      revenue: Number(row.revenue).toFixed(2),
    }));
  }

  private async getTopService(
    barbershopId: string,
    from: Date,
    to: Date,
  ): Promise<TopServiceEntry | null> {
    const row = await this.ticketItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.ticket', 'ticket')
      .innerJoin(ServiceOrmEntity, 'service', 'service.id = item.itemId')
      .select('item.itemId', 'serviceId')
      .addSelect('service.name', 'serviceName')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.barbershopId = :barbershopId', { barbershopId })
      .andWhere('item.itemType = :itemType', {
        itemType: TicketItemType.SERVICE,
      })
      .andWhere('ticket.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('item.itemId')
      .addGroupBy('service.name')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne<{ serviceId: string; serviceName: string; count: string }>();

    if (!row) return null;

    return {
      serviceId: row.serviceId,
      serviceName: row.serviceName,
      count: Number(row.count),
    };
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
