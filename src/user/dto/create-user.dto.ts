//Defines validation rules for user registration, ensuring proper input format
//and secure handling of user credentials during account creation.
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

}