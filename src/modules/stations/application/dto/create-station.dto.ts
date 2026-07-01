import { IsInt, Min } from 'class-validator';

export class CreateStationDto {
  @IsInt()
  @Min(1)
  number: number;
}
