import {
  Body,
  Controller,
  ForbiddenException,
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
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { TenantId } from '../../../../common/decorators/tenant-id.decorator';
import { Role } from '../../../../common/constants/role.enum';
import type { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';
import { CreateBarbershopUseCase } from '../../application/use-cases/create-barbershop.use-case';
import { ListBarbershopsUseCase } from '../../application/use-cases/list-barbershops.use-case';
import { SetBarbershopActiveUseCase } from '../../application/use-cases/set-barbershop-active.use-case';
import { CreateBranchSupervisorUseCase } from '../../application/use-cases/create-branch-supervisor.use-case';
import { UpdateBarbershopUseCase } from '../../application/use-cases/update-barbershop.use-case';
import { GetCurrentBarbershopUseCase } from '../../application/use-cases/get-current-barbershop.use-case';
import { LookupBarbershopUseCase } from '../../application/use-cases/lookup-barbershop.use-case';
import { ListUsersUseCase } from '../../../users/application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../../../users/application/use-cases/update-user.use-case';
import { SetUserActiveUseCase } from '../../../users/application/use-cases/set-user-active.use-case';
import { ResetUserPasswordUseCase } from '../../../users/application/use-cases/reset-user-password.use-case';
import { UpdateUserDto } from '../../../users/application/dto/update-user.dto';
import { ResetPasswordDto } from '../../../users/application/dto/reset-password.dto';
import { CreateBarbershopDto } from '../../application/dto/create-barbershop.dto';
import { CreateBranchSupervisorDto } from '../../application/dto/create-branch-supervisor.dto';
import { UpdateBarbershopDto } from '../../application/dto/update-barbershop.dto';
import { ActiveStatusDto } from '../../../../common/dto/active-status.dto';
import { UserResponseDto } from '../../../users/application/dto/user-response.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
// Branch CRUD + supervisor management is admin-only. Supervisors themselves
// use `POST /users` for barber/seller creation, not these endpoints.
@Roles(Role.ADMIN)
export class TenantsController {
  constructor(
    private readonly createBarbershop: CreateBarbershopUseCase,
    private readonly listBarbershops: ListBarbershopsUseCase,
    private readonly setBarbershopActive: SetBarbershopActiveUseCase,
    private readonly createBranchSupervisor: CreateBranchSupervisorUseCase,
    private readonly updateBarbershop: UpdateBarbershopUseCase,
    private readonly getCurrentBarbershop: GetCurrentBarbershopUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly setUserActive: SetUserActiveUseCase,
    private readonly resetUserPassword: ResetUserPasswordUseCase,
    private readonly lookupBarbershop: LookupBarbershopUseCase,
  ) {}

  // Public — used by the login page to show the tenant's brand before the
  // user submits credentials. Only exposes non-sensitive fields (name, logo,
  // isActive) to prevent enumeration of tenant internals.
  @Get('lookup/:code')
  @Public()
  @Roles()
  lookup(@Param('code') code: string) {
    return this.lookupBarbershop.execute(code);
  }

  // Overrides the class-level ADMIN restriction so any user attached to a
  // branch can read it (supervisor/barber/seller pinned) and admins can
  // access it via the X-Tenant-Code switcher.
  @Get('current')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.BARBER, Role.SELLER)
  findCurrent(
    @CurrentUser() user: AuthenticatedUser,
    @TenantId() tenantId: string | null,
  ) {
    const targetId = user.barbershopId ?? tenantId;
    if (!targetId) {
      throw new ForbiddenException('No barbershop context');
    }
    return this.getCurrentBarbershop.execute(targetId);
  }

  @Patch('current')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  updateCurrent(
    @CurrentUser() user: AuthenticatedUser,
    @TenantId() tenantId: string | null,
    @Body() dto: UpdateBarbershopDto,
  ) {
    const targetId = user.barbershopId ?? tenantId;
    if (!targetId) {
      throw new ForbiddenException('No barbershop context');
    }
    return this.updateBarbershop.execute(targetId, dto);
  }

  @Post()
  create(@Body() dto: CreateBarbershopDto) {
    return this.createBarbershop.execute(dto);
  }

  @Get()
  findAll() {
    return this.listBarbershops.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getCurrentBarbershop.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBarbershopDto) {
    return this.updateBarbershop.execute(id, dto);
  }

  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body() dto: ActiveStatusDto) {
    return this.setBarbershopActive.execute(id, dto.isActive);
  }

  // ── Supervisors of a branch ─────────────────────────────────────────
  // Admin-only endpoints for CRUD-ing the supervisor accounts of a specific
  // branch. Supervisors are branch-scoped users (barbershopId set) with the
  // SUPERVISOR role; they manage the branch's staff and inventory but can't
  // manage other branches or create peer supervisors.

  @Post(':id/supervisors')
  async createSupervisor(
    @Param('id') id: string,
    @Body() dto: CreateBranchSupervisorDto,
  ): Promise<UserResponseDto> {
    const supervisor = await this.createBranchSupervisor.execute(id, dto);
    return UserResponseDto.fromDomain(supervisor);
  }

  @Get(':id/supervisors')
  async listSupervisors(@Param('id') id: string): Promise<UserResponseDto[]> {
    const users = await this.listUsers.execute(id);
    return users
      .filter((u) => u.role === Role.SUPERVISOR)
      .map((u) => UserResponseDto.fromDomain(u));
  }

  @Patch(':id/supervisors/:userId')
  async updateSupervisor(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUser.execute(id, userId, dto);
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id/supervisors/:userId/active')
  async setSupervisorActive(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: ActiveStatusDto,
  ): Promise<UserResponseDto> {
    const user = await this.setUserActive.execute(id, userId, dto.isActive);
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id/supervisors/:userId/password')
  async resetSupervisorPassword(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<UserResponseDto> {
    const user = await this.resetUserPassword.execute(id, userId, dto.password);
    return UserResponseDto.fromDomain(user);
  }
}
