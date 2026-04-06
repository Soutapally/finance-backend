//Defines validation rules for updating financial records while allowing partial updates,
//ensuring data consistency and controlled modifications.
import { IsOptional, IsNumber, IsEnum, IsString, IsDateString, Min, Max, IsBoolean, IsUrl } from 'class-validator';
import { FinanceType, FinanceCategory } from '../finance.entity';
import { Type } from 'class-transformer';

export class UpdateFinanceDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(999999999.99)
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsEnum(FinanceType)
  type?: FinanceType;

  @IsOptional()
  @IsEnum(FinanceCategory)
  category?: FinanceCategory;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  receiptUrl?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurringInterval?: string;
}