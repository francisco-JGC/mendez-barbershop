import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * Payload for creating the supervisor of a branch. A supervisor logs in with
 * username + branch code (like barbers/sellers) — no email needed.
 */
export class CreateBranchSupervisorDto {
  @IsString()
  @MaxLength(120)
  name: string;

  // Same character set the web form enforces on barbers so all branch users
  // share the login UX: lowercase, digits, dot, dash, underscore.
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-z0-9._-]+$/, {
    message:
      'username must contain only lowercase letters, numbers, dots, dashes or underscores',
  })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
