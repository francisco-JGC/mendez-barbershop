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
import { CreateServiceUseCase } from '../../application/use-cases/create-service.use-case';
import { ListServicesUseCase } from '../../application/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/update-service.use-case';
import { CreateServiceDto } from '../../application/dto/create-service.dto';
import { UpdateServiceDto } from '../../application/dto/update-service.dto';

@Controller('services')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ServicesController {
  constructor(
    private readonly createService: CreateServiceUseCase,
    private readonly listServices: ListServicesUseCase,
    private readonly updateService: UpdateServiceUseCase,
  ) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.listServices.execute(user.barbershopId!);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateServiceDto,
  ) {
    return this.createService.execute(user.barbershopId!, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.updateService.execute(user.barbershopId!, id, dto);
  }
}
