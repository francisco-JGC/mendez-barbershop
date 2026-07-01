import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9\-]+$/, {
    message: 'barcode must contain only letters, numbers or hyphens',
  })
  barcode?: string;

  @IsNumberString()
  price: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
