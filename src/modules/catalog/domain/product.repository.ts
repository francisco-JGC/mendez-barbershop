import { Product } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface NewProduct {
  barbershopId: string;
  name: string;
  price: string;
  stock: number;
  lowStockThreshold: number;
}

export interface IProductRepository {
  findAllByTenant(barbershopId: string): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByIds(barbershopId: string, ids: string[]): Promise<Product[]>;
  create(data: NewProduct): Promise<Product>;
  save(product: Product): Promise<Product>;
}
