import { Product } from './product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface NewProduct {
  barbershopId: string;
  name: string;
  barcode: string | null;
  price: string;
  stock: number;
  lowStockThreshold: number;
}

export interface IProductRepository {
  findAllByTenant(barbershopId: string): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByIds(barbershopId: string, ids: string[]): Promise<Product[]>;
  findByBarcode(barbershopId: string, barcode: string): Promise<Product | null>;
  create(data: NewProduct): Promise<Product>;
  save(product: Product): Promise<Product>;
}
