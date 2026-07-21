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
import { ResolvedTenantId } from '../../../../common/decorators/resolved-tenant-id.decorator';
import { Role } from '../../../../common/constants/role.enum';
import { ActiveStatusDto } from '../../../../common/dto/active-status.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { SetUserActiveUseCase } from '../../application/use-cases/set-user-active.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { ResetUserPasswordUseCase } from '../../application/use-cases/reset-user-password.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly setUserActive: SetUserActiveUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly resetUserPassword: ResetUserPasswordUseCase,
  ) {}

  @Post()
  async create(
    @ResolvedTenantId() barbershopId: string,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const created = await this.createUser.execute(barbershopId, dto);
    return UserResponseDto.fromDomain(created);
  }

  // Sellers need to list users so the POS can offer a barber selector when a
  // ticket includes a service. The response only exposes fields already in the
  // JWT surface, so no extra data leaks.
  @Get()
  @Roles(Role.ADMIN, Role.SELLER)
  async findAll(
    @ResolvedTenantId() barbershopId: string,
  ): Promise<UserResponseDto[]> {
    const users = await this.listUsers.execute(barbershopId);
    return users.map((u) => UserResponseDto.fromDomain(u));
  }

  @Patch(':id/active')
  async setActive(
    @ResolvedTenantId() barbershopId: string,
    @Param('id') id: string,
    @Body() dto: ActiveStatusDto,
  ): Promise<UserResponseDto> {
    const updated = await this.setUserActive.execute(
      barbershopId,
      id,
      dto.isActive,
    );
    return UserResponseDto.fromDomain(updated);
  }

  @Patch(':id')
  async update(
    @ResolvedTenantId() barbershopId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updated = await this.updateUser.execute(barbershopId, id, dto);
    return UserResponseDto.fromDomain(updated);
  }

  @Patch(':id/password')
  async resetPassword(
    @ResolvedTenantId() barbershopId: string,
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<UserResponseDto> {
    const updated = await this.resetUserPassword.execute(
      barbershopId,
      id,
      dto.password,
    );
    return UserResponseDto.fromDomain(updated);
  }
}
