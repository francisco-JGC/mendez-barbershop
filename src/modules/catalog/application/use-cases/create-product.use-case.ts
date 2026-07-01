import { Inject, Injectable } from '@nestjs/common';
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

  execute(barbershopId: string, dto: CreateProductDto): Promise<Product> {
    return this.productRepository.create({
      barbershopId,
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      lowStockThreshold: dto.lowStockThreshold ?? 3,
    });
  }
}
