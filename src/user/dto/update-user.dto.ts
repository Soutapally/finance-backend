//Defines validation rules for updating user details, supporting partial updates
//while ensuring data integrity and enforcing role-based constraints.

import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;


  @IsOptional()
  @IsEnum(Role, {
    message: 'Role must be either admin, analyst, or viewer',
  })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}