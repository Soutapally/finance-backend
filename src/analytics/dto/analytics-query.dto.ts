//Handles query parameters for analytics APIs such as 
  //finance type filtering, and result limits for flexible data analysis.
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { FinanceType } from '../../finance/finance.entity';

export enum TimeGranularity {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsEnum(TimeGranularity)
  granularity?: TimeGranularity;

  @IsOptional()
  @IsEnum(FinanceType)
  type?: FinanceType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  limit?: number = 6;
}