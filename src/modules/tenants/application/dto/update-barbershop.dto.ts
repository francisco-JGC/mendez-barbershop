import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBarbershopDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;
}
