import { Inject, Injectable } from '@nestjs/common';
import {
  BarberDashboardSummary,
  DASHBOARD_QUERY_SERVICE,
} from '../ports/dashboard-query.service';
import type { IDashboardQueryService } from '../ports/dashboard-query.service';
import { DashboardPeriod, resolveDateRange } from '../date-range.util';

@Injectable()
export class GetBarberDashboardUseCase {
  constructor(
    @Inject(DASHBOARD_QUERY_SERVICE)
    private readonly dashboardQueryService: IDashboardQueryService,
  ) {}

  execute(
    barbershopId: string,
    barberId: string,
    period: DashboardPeriod,
  ): Promise<BarberDashboardSummary> {
    const { from, to } = resolveDateRange(period);
    return this.dashboardQueryService.getBarberSummary(
      barbershopId,
      barberId,
      from,
      to,
    );
  }
}
