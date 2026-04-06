//Validates user login credentials ensuring proper email format and secure password constraints,
 //forming the entry point for authentication in the system.
 
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}