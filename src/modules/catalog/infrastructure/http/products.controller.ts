import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResolvedTenantId } from '../../../../common/decorators/resolved-tenant-id.decorator';
import { Role } from '../../../../common/constants/role.enum';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { GetProductByBarcodeUseCase } from '../../application/use-cases/get-product-by-barcode.use-case';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { UpdateProductDto } from '../../application/dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly getProductByBarcode: GetProductByBarcodeUseCase,
  ) {}

  @Get()
  findAll(@ResolvedTenantId() barbershopId: string) {
    return this.listProducts.execute(barbershopId);
  }

  @Get('by-barcode/:barcode')
  findByBarcode(
    @ResolvedTenantId() barbershopId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.getProductByBarcode.execute(barbershopId, barcode);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @ResolvedTenantId() barbershopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.createProduct.execute(barbershopId, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @ResolvedTenantId() barbershopId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.updateProduct.execute(barbershopId, id, dto);
  }
}
