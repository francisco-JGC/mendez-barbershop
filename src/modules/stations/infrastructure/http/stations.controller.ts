import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { CreateStationUseCase } from '../../application/use-cases/create-station.use-case';
import { ListStationsUseCase } from '../../application/use-cases/list-stations.use-case';
import { AssignBarberUseCase } from '../../application/use-cases/assign-barber.use-case';
import { ReleaseStationUseCase } from '../../application/use-cases/release-station.use-case';
import { CreateStationDto } from '../../application/dto/create-station.dto';
import { AssignBarberDto } from '../../application/dto/assign-barber.dto';

@Controller('stations')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class StationsController {
  constructor(
    private readonly createStation: CreateStationUseCase,
    private readonly listStations: ListStationsUseCase,
    private readonly assignBarber: AssignBarberUseCase,
    private readonly releaseStation: ReleaseStationUseCase,
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.listStations.execute(user.barbershopId!);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStationDto,
  ) {
    return this.createStation.execute(user.barbershopId!, dto);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignBarberDto,
  ) {
    return this.assignBarber.execute(user.barbershopId!, id, dto.barberId);
  }

  @Patch(':id/release')
  @Roles(Role.ADMIN)
  release(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.releaseStation.execute(user.barbershopId!, id);
  }
}
