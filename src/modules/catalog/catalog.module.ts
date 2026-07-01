import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrmEntity } from './infrastructure/persistence/service.orm-entity';
import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity';
import { ServiceRepository } from './infrastructure/persistence/service.repository';
import { ProductRepository } from './infrastructure/persistence/product.repository';
import { SERVICE_REPOSITORY } from './domain/service.repository';
import { PRODUCT_REPOSITORY } from './domain/product.repository';
import { ServicesController } from './infrastructure/http/services.controller';
import { ProductsController } from './infrastructure/http/products.controller';
import { CreateServiceUseCase } from './application/use-cases/create-service.use-case';
import { ListServicesUseCase } from './application/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update-service.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrmEntity, ProductOrmEntity])],
  controllers: [ServicesController, ProductsController],
  providers: [
    { provide: SERVICE_REPOSITORY, useClass: ServiceRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
    CreateServiceUseCase,
    ListServicesUseCase,
    UpdateServiceUseCase,
    CreateProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
  ],
  exports: [SERVICE_REPOSITORY, PRODUCT_REPOSITORY],
})
export class CatalogModule {}
