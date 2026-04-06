//Provides role-based analytics APIs to retrieve financial summaries,
 //trends, and insights for data-driven decision making.

import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../user/user.entity';
import { DateRangeDto } from './dto/date-range.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { FinanceType } from '../finance/finance.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({
  summary: 'Get financial summary',
  description: 'Returns total income, expense and balance (Read-only for all roles)',
})
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  async getSummary(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.analyticsService.getSummary(userId, role, dateRange);
  }

  @Get('categories')
  @ApiOperation({
  summary: 'Get category breakdown',
  description: 'Returns total spending grouped by category',
})
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  async getCategoryBreakdown(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Query('type') type: FinanceType,
    @Query() dateRange: DateRangeDto,
  ) {
    return this.analyticsService.getCategoryBreakdown(userId, role, type, dateRange);
  }

  @Get('trends/monthly/:year')
  @ApiOperation({
  summary: 'Get monthly trends',
  description: 'Accessible by Analyst and Admin only',
})
  @Roles(Role.ADMIN, Role.ANALYST)
  async getMonthlyTrends(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Param('year') year: number,
  ) {
    return this.analyticsService.getMonthlyTrends(userId, role, year);
  }

  @Get('daily-patterns')
  @ApiOperation({
  summary: 'Get daily spending patterns',
})
  @Roles(Role.ADMIN, Role.ANALYST)
  async getDailyPatterns(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Query('days') days: number = 30,
  ) {
    return this.analyticsService.getDailyPatterns(userId, role, days);
  }

  @Get('top-categories')
  @ApiOperation({
  summary: 'Get top spending categories',
})
  @Roles(Role.ADMIN, Role.ANALYST, Role.VIEWER)
  async getTopSpendingCategories(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Query('limit') limit: number = 5,
  ) {
    return this.analyticsService.getTopSpendingCategories(userId, role, limit);
  }

  @Get('year-over-year')
  @ApiOperation({
  summary: 'Year over year comparison',
})
  @Roles(Role.ADMIN, Role.ANALYST)
  async getYearOverYearComparison(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.analyticsService.getYearOverYearComparison(userId, role);
  }
}