import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResolvedTenantId } from '../../../../common/decorators/resolved-tenant-id.decorator';
import { Role } from '../../../../common/constants/role.enum';
import { GetSettingsUseCase } from '../../application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../../application/use-cases/update-settings.use-case';
import { UpdateSettingsDto } from '../../application/dto/update-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly getSettings: GetSettingsUseCase,
    private readonly updateSettings: UpdateSettingsUseCase,
  ) {}

  // Sellers need to read settings to render receipts with the correct logo,
  // footer and printBarbershopName toggle — same behaviour as the web POS.
  @Get()
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.SELLER)
  findOne(@ResolvedTenantId() barbershopId: string) {
    return this.getSettings.execute(barbershopId);
  }

  @Patch()
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  update(
    @ResolvedTenantId() barbershopId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.updateSettings.execute(barbershopId, dto);
  }
}
