import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  execute(barbershopId: string): Promise<Product[]> {
    return this.productRepository.findAllByTenant(barbershopId);
  }
}
