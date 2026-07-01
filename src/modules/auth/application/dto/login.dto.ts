import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  // Email (for admins) or username (for barbers).
  @IsString()
  @MinLength(1)
  identifier: string;

  @IsString()
  @MinLength(8)
  password: string;
}
