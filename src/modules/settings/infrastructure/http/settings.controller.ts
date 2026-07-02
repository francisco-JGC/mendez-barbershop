import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { GetSettingsUseCase } from '../../application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../../application/use-cases/update-settings.use-case';
import { UpdateSettingsDto } from '../../application/dto/update-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SettingsController {
  constructor(
    private readonly getSettings: GetSettingsUseCase,
    private readonly updateSettings: UpdateSettingsUseCase,
  ) {}

  @Get()
  findOne(@CurrentUser() user: AuthenticatedUser) {
    return this.getSettings.execute(user.barbershopId!);
  }

  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.updateSettings.execute(user.barbershopId!, dto);
  }
}
