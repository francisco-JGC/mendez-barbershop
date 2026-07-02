import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  commissionRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  receiptFooter?: string;
}
