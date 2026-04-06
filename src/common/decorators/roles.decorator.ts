//Defines role-based access metadata for routes, enabling authorization
 //and enforcing permissions through guards.

import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);