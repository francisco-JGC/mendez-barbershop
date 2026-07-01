import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TicketItemType } from '../../domain/ticket-item.entity';

export class CreateTicketItemDto {
  @IsEnum(TicketItemType)
  itemType: TicketItemType;

  @IsUUID()
  itemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateTicketDto {
  @IsOptional()
  @IsUUID()
  barberId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTicketItemDto)
  items: CreateTicketItemDto[];
}
