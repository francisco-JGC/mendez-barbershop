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
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '../../../../common/constants/role.enum';
import { CreateBarbershopUseCase } from '../../application/use-cases/create-barbershop.use-case';
import { ListBarbershopsUseCase } from '../../application/use-cases/list-barbershops.use-case';
import { SetBarbershopActiveUseCase } from '../../application/use-cases/set-barbershop-active.use-case';
import { CreateBarbershopAdminUseCase } from '../../application/use-cases/create-barbershop-admin.use-case';
import { CreateBarbershopDto } from '../../application/dto/create-barbershop.dto';
import { CreateBarbershopAdminDto } from '../../application/dto/create-barbershop-admin.dto';
import { ActiveStatusDto } from '../../../../common/dto/active-status.dto';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class TenantsController {
  constructor(
    private readonly createBarbershop: CreateBarbershopUseCase,
    private readonly listBarbershops: ListBarbershopsUseCase,
    private readonly setBarbershopActive: SetBarbershopActiveUseCase,
    private readonly createBarbershopAdmin: CreateBarbershopAdminUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateBarbershopDto) {
    return this.createBarbershop.execute(dto);
  }

  @Get()
  findAll() {
    return this.listBarbershops.execute();
  }

  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body() dto: ActiveStatusDto) {
    return this.setBarbershopActive.execute(id, dto.isActive);
  }

  @Post(':id/admin')
  async createAdmin(
    @Param('id') id: string,
    @Body() dto: CreateBarbershopAdminDto,
  ): Promise<UserResponseDto> {
    const admin = await this.createBarbershopAdmin.execute(id, dto);
    return UserResponseDto.fromDomain(admin);
  }
}
