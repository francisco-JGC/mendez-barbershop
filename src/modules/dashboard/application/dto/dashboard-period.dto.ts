import { IsIn, IsOptional } from 'class-validator';
import type { DashboardPeriod } from '../date-range.util';

export class DashboardPeriodDto {
  @IsOptional()
  @IsIn(['day', 'yesterday', 'week', 'month'])
  period?: DashboardPeriod = 'day';
}
