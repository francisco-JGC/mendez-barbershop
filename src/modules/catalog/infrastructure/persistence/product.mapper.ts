import { Product } from '../../domain/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(orm: ProductOrmEntity): Product {
    return new Product(
      orm.id,
      orm.barbershopId,
      orm.name,
      orm.barcode,
      orm.price,
      orm.stock,
      orm.lowStockThreshold,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toPersistence(domain: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = domain.id;
    orm.barbershopId = domain.barbershopId;
    orm.name = domain.name;
    orm.barcode = domain.barcode;
    orm.price = domain.price;
    orm.stock = domain.stock;
    orm.lowStockThreshold = domain.lowStockThreshold;
    orm.isActive = domain.isActive;
    return orm;
  }
}
