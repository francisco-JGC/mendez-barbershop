import { IsUUID } from 'class-validator';

export class AssignBarberDto {
  @IsUUID()
  barberId: string;
}
