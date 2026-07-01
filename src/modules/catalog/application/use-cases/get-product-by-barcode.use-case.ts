import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';

@Injectable()
export class GetProductByBarcodeUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(barbershopId: string, barcode: string): Promise<Product> {
    const product = await this.productRepository.findByBarcode(
      barbershopId,
      barcode,
    );
    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
