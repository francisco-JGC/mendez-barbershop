import { IsNumberString, IsString, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsNumberString()
  price: string;
}
