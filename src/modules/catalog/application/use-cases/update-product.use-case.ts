import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/product.repository';
import type { IProductRepository } from '../../domain/product.repository';
import { Product } from '../../domain/product.entity';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    barbershopId: string,
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product || !product.belongsToTenant(barbershopId)) {
      throw new NotFoundException('Product not found');
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.lowStockThreshold !== undefined)
      product.lowStockThreshold = dto.lowStockThreshold;

    return this.productRepository.save(product);
  }
}
