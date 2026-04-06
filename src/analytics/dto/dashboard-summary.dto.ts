//Defines input parameters for generating dashboard summaries,
//including date ranges, predefined time filters, and comparison options.

import { IsOptional, IsDateString, IsEnum, IsBoolean, IsString } from 'class-validator';

export enum TimeRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class DashboardSummaryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange;

  @IsOptional()
  @IsBoolean()
  compareWithPrevious?: boolean;
}

export class AdvancedAnalyticsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month' | 'category';

  @IsOptional()
  @IsBoolean()
  includeForecast?: boolean;
}