import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateBarbershopDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(63)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'subdomain must contain only lowercase letters, numbers and hyphens',
  })
  subdomain: string;
}
