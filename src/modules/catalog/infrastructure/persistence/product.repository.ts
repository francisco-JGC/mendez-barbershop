import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  IProductRepository,
  NewProduct,
} from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';
import { ProductMapper } from './product.mapper';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly ormRepository: Repository<ProductOrmEntity>,
  ) {}

  async findAllByTenant(barbershopId: string): Promise<Product[]> {
    const rows = await this.ormRepository.find({ where: { barbershopId } });
    return rows.map((row) => ProductMapper.toDomain(row));
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.ormRepository.findOne({ where: { id } });
    return row ? ProductMapper.toDomain(row) : null;
  }

  async findByIds(barbershopId: string, ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const rows = await this.ormRepository.find({
      where: { barbershopId, id: In(ids) },
    });
    return rows.map((row) => ProductMapper.toDomain(row));
  }

  async findByBarcode(
    barbershopId: string,
    barcode: string,
  ): Promise<Product | null> {
    const row = await this.ormRepository.findOne({
      where: { barbershopId, barcode },
    });
    return row ? ProductMapper.toDomain(row) : null;
  }

  async create(data: NewProduct): Promise<Product> {
    const created = this.ormRepository.create(data);
    const saved = await this.ormRepository.save(created);
    return ProductMapper.toDomain(saved);
  }

  async save(product: Product): Promise<Product> {
    const saved = await this.ormRepository.save(
      ProductMapper.toPersistence(product),
    );
    return ProductMapper.toDomain(saved);
  }
}
