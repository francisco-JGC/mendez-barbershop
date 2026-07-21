import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ResolvedTenantId } from '../../../../common/decorators/resolved-tenant-id.decorator';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case';
import { GetBarberDashboardUseCase } from '../../application/use-cases/get-barber-dashboard.use-case';
import { DashboardPeriodDto } from '../../application/dto/dashboard-period.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly getAdminDashboard: GetAdminDashboardUseCase,
    private readonly getBarberDashboard: GetBarberDashboardUseCase,
  ) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  admin(
    @ResolvedTenantId() barbershopId: string,
    @Query() query: DashboardPeriodDto,
  ) {
    return this.getAdminDashboard.execute(barbershopId, query.period ?? 'day');
  }

  @Get('barber')
  @Roles(Role.BARBER)
  barber(
    @CurrentUser() user: AuthenticatedUser,
    @ResolvedTenantId() barbershopId: string,
    @Query() query: DashboardPeriodDto,
  ) {
    return this.getBarberDashboard.execute(
      barbershopId,
      user.userId,
      query.period ?? 'day',
    );
  }
}
