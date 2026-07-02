import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Min,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  // Barcode is nullable to allow explicitly clearing it (send null) — that's
  // why we use ValidateIf instead of IsOptional so `null` bypasses the regex.
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9\-]+$/, {
    message: 'barcode must contain only letters, numbers or hyphens',
  })
  barcode?: string | null;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
