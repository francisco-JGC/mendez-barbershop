import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../../../../common/constants/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9._-]+$/, {
    message:
      'username must contain only lowercase letters, numbers, dots, underscores or hyphens',
  })
  username?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
