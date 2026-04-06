//Structures user data returned in API responses, exposing only relevant fields
 //while maintaining consistency and abstraction from internal entities
import { Role } from '../user.entity';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: Role;
  isActive!: boolean;
  isDeleted!: boolean;
  lastLoginAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}