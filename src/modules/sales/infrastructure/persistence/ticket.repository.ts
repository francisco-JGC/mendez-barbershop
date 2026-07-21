import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import {
  CreateTicketInput,
  ITicketRepository,
  PaginatedTickets,
  TicketDateRange,
  TicketPagination,
} from '../../domain/ticket.repository';
import { Ticket } from '../../domain/ticket.entity';
import { TicketItemType } from '../../domain/ticket-item.entity';
import { TicketOrmEntity } from './ticket.orm-entity';
import { TicketItemOrmEntity } from './ticket-item.orm-entity';
import { TicketMapper } from './ticket.mapper';
import { ProductOrmEntity } from '../../../catalog/infrastructure/persistence/product.orm-entity';

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(TicketOrmEntity)
    private readonly ormRepository: Repository<TicketOrmEntity>,
  ) {}

  async create(input: CreateTicketInput): Promise<Ticket> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of input.items) {
        if (item.itemType !== TicketItemType.PRODUCT) {
          continue;
        }

        const product = await queryRunner.manager.findOne(ProductOrmEntity, {
          where: { id: item.itemId, barbershopId: input.barbershopId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.itemId} not found`);
        }

        product.stock -= item.quantity;
        await queryRunner.manager.save(ProductOrmEntity, product);
      }

      const ticket = queryRunner.manager.create(TicketOrmEntity, {
        barbershopId: input.barbershopId,
        barberId: input.barberId,
        stationId: input.stationId,
        total: input.total,
        items: input.items.map((item) =>
          queryRunner.manager.create(TicketItemOrmEntity, item),
        ),
      });

      const saved = await queryRunner.manager.save(TicketOrmEntity, ticket);
      await queryRunner.commitTransaction();
      return TicketMapper.toDomain(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<Ticket | null> {
    const row = await this.ormRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    return row ? TicketMapper.toDomain(row) : null;
  }

  async findAllByTenant(
    barbershopId: string,
    pagination: TicketPagination,
    range?: TicketDateRange,
  ): Promise<PaginatedTickets> {
    const [rows, total] = await this.ormRepository.findAndCount({
      where: {
        barbershopId,
        ...(range?.from && range?.to
          ? { createdAt: Between(range.from, range.to) }
          : {}),
      },
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    });
    return { items: rows.map((row) => TicketMapper.toDomain(row)), total };
  }

  async findAllByBarber(
    barbershopId: string,
    barberId: string,
    pagination: TicketPagination,
    range?: TicketDateRange,
  ): Promise<PaginatedTickets> {
    const [rows, total] = await this.ormRepository.findAndCount({
      where: {
        barbershopId,
        barberId,
        ...(range?.from && range?.to
          ? { createdAt: Between(range.from, range.to) }
          : {}),
      },
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    });
    return { items: rows.map((row) => TicketMapper.toDomain(row)), total };
  }
}
