import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  // Email (for admins) or username (for barbers and sellers).
  @IsString()
  @MinLength(1)
  identifier: string;

  @IsString()
  @MinLength(8)
  password: string;
}
