import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

// ~150KB base64 → covers small logos comfortably while capping row size.
const MAX_LOGO_LENGTH = 200_000;

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

  // null clears the logo; a data URL replaces it.
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString()
  @MaxLength(MAX_LOGO_LENGTH)
  @Matches(/^data:image\/(png|jpe?g);base64,/, {
    message: 'logo must be a PNG or JPEG data URL',
  })
  logo?: string | null;
}
