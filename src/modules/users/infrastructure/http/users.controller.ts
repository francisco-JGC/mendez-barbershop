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
import { TenantGuard } from '../../../../common/guards/tenant.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Role } from '../../../../common/constants/role.enum';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { ActiveStatusDto } from '../../../../common/dto/active-status.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { SetUserActiveUseCase } from '../../application/use-cases/set-user-active.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly setUserActive: SetUserActiveUseCase,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.createUser.execute(user.barbershopId!, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.listUsers.execute(user.barbershopId!);
  }

  @Patch(':id/active')
  setActive(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ActiveStatusDto,
  ) {
    return this.setUserActive.execute(user.barbershopId!, id, dto.isActive);
  }
}
