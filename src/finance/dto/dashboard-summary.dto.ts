//Provides flexible input models for dashboard summaries and advanced analytics,
//enabling time-based filtering, grouping, and insightful financial data exploration.

import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';


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
  @IsString()
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
  @IsString()
  includeForecast?: boolean; 
}