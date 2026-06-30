import { IsBoolean } from 'class-validator';

export class ActiveStatusDto {
  @IsBoolean()
  isActive: boolean;
}
