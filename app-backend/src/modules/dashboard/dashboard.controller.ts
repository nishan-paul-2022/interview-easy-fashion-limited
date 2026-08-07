import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { RoleName } from '@/common/enums/role-name.enum';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { AuditLogQueryDto } from '@/modules/dashboard/dto/audit-log-query.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.MANAGER)
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('reports/login-activity')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.SUPER_ADMIN)
  getLoginActivity(@Query() query: AuditLogQueryDto) {
    return this.dashboardService.getLoginActivity(query);
  }
}
