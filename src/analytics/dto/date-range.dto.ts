//Defines optional start and end date filters for analytics queries,
 //enabling time-based data retrieval and flexible reporting.
 
import { IsOptional, IsDateString } from 'class-validator';

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}