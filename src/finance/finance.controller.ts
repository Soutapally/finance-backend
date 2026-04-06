// Manages financial operations through secure, role-based endpoints,
//enabling controlled access to create, view, update, and analyze financial data.
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { QueryFinanceDto } from './dto/query-finance.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ADMIN ONLY
 @Post()
 @ApiOperation({
  summary: 'Create finance record',
  description: 'Admin only',
})
@Roles(Role.ADMIN) 
async create(
  @Body() dto: CreateFinanceDto,
  @CurrentUser('id') userId: string, 
) {
  console.log('USER ID:', userId);
  return this.financeService.create(dto, userId);
}

  // ALL ROLES
  @Get()
  @ApiOperation({
  summary: 'Create finance record',
  description: 'Admin only',
})
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  findAll(@Query() query: QueryFinanceDto) {
    return this.financeService.findAll(query);
  }

  // ALL ROLES
  @Get('dashboard/summary')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  getDashboardSummary(@Query() dto: DashboardSummaryDto) {
    return this.financeService.getDashboardSummary(dto);
  }

  // ADMIN + ANALYST
  @Get('analytics')
  @Roles(Role.ADMIN, Role.ANALYST)
  getAnalytics() {
    return this.financeService.getAnalytics();
  }

  // ALL ROLES
  @Get(':id')
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findOne(id);
  }

  //ADMIN ONLY
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFinanceDto,
  ) {
    return this.financeService.update(id, dto);
  }

 
  // ADMIN ONLY
  @Delete(':id')
  @ApiOperation({
  summary: 'Delete finance record',
  description: 'Admin only',
})
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.remove(id);
  }
}