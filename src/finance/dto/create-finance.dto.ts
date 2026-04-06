//Validates and structures financial transaction input with strict constraints,
 //ensuring data integrity and consistency for reliable financial record management.

import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsString,
  IsDateString,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { FinanceType, FinanceCategory } from '../finance.entity';
import { Type } from 'class-transformer';

export class CreateFinanceDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, {
    message: 'Amount must be greater than 0. Please enter a valid amount.',
  })
  @Max(1000000000000, {
    message: 'Amount is too large. Please enter a realistic value.',
  })
  amount!: number;

  @IsNotEmpty({ message: 'Transaction type is required' })
  @IsEnum(FinanceType, {
    message: 'Type must be either "income" or "expense"',
  })
  type!: FinanceType;

  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(FinanceCategory, {
    message: 'Invalid category selected',
  })
  category!: FinanceCategory;

  @IsOptional()
  @IsDateString({}, {
    message: 'Date must be in valid format (YYYY-MM-DD)',
  })
  date?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a valid string' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Receipt URL must be a valid URL' })
  receiptUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'isRecurring must be true or false' })
  isRecurring?: boolean;

  @IsOptional()
  @IsString({
    message: 'Recurring interval must be a valid string (e.g., monthly)',
  })
  recurringInterval?: string;
}