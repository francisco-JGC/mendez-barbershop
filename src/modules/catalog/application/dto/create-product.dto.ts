import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(120)
  name: string;

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
