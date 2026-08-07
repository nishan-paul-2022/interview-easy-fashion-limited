import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleName } from '@/common/enums/role-name.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserRoleDto } from '@/modules/users/dto/update-user-role.dto';
import { UpdateUserStatusDto } from '@/modules/users/dto/update-user-status.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { UserQueryDto } from '@/modules/users/dto/user-query.dto';
import { UsersService } from '@/modules/users/users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleName.SUPER_ADMIN)
  async createDashboardUser(@Body() dto: CreateUserDto) {
    try {
      return await this.usersService.createDashboardUser(dto);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findByIdSafe(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch(':id')
  @Roles(RoleName.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.updateSafe(id, dto);
  }

  @Patch(':id/status')
  @Roles(RoleName.SUPER_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    if (id === currentUser.id) {
      throw new ForbiddenException('Cannot change your own status');
    }
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.updateStatus(id, dto.isActive);
  }

  @Patch(':id/role')
  @Roles(RoleName.SUPER_ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    if (id === currentUser.id) {
      throw new ForbiddenException('Cannot change your own role');
    }
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.updateRole(id, dto.role);
  }
}
