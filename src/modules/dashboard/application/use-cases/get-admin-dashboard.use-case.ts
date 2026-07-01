import { Inject, Injectable } from '@nestjs/common';
import {
  AdminDashboardSummary,
  DASHBOARD_QUERY_SERVICE,
} from '../ports/dashboard-query.service';
import type { IDashboardQueryService } from '../ports/dashboard-query.service';
import { DashboardPeriod, resolveDateRange } from '../date-range.util';

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(
    @Inject(DASHBOARD_QUERY_SERVICE)
    private readonly dashboardQueryService: IDashboardQueryService,
  ) {}

  execute(
    barbershopId: string,
    period: DashboardPeriod,
  ): Promise<AdminDashboardSummary> {
    const { from, to } = resolveDateRange(period);
    return this.dashboardQueryService.getAdminSummary(barbershopId, from, to);
  }
}
