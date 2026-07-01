import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(barbershopId: string, dto: CreateProductDto): Promise<Product> {
    if (dto.barcode) {
      const existing = await this.productRepository.findByBarcode(
        barbershopId,
        dto.barcode,
      );
      if (existing) {
        throw new ConflictException('Barcode already in use for this tenant');
      }
    }

    return this.productRepository.create({
      barbershopId,
      name: dto.name,
      barcode: dto.barcode ?? null,
      price: dto.price,
      stock: dto.stock,
      lowStockThreshold: dto.lowStockThreshold ?? 3,
    });
  }
}
