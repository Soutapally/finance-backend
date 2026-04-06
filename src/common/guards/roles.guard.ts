//Enforces role-based access control by validating user permissions against route metadata,
//ensuring secure and controlled access to resources with meaningful, user-friendly error feedback.

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../user/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    if (!user) {
      throw new UnauthorizedException({
        message: 'You must be logged in to access this resource.',
        action: 'Please login and try again.',
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        message: 'Your account is inactive.',
        action: 'Contact admin to activate your account.',
      });
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        message: this.getFriendlyMessage(user.role, method, url),
        role: user.role,
        endpoint: url,
      });
    }

    return true;
  }

  private getFriendlyMessage(role: Role, method: string, url: string): string {
   
    if (role === Role.VIEWER && method === 'POST') {
      return 'Viewers are not allowed to create records.';
    }

    if (role === Role.VIEWER && method === 'PATCH') {
      return 'Viewers are not allowed to update records.';
    }

    if (role === Role.VIEWER && method === 'DELETE') {
      return 'Viewers are not allowed to delete records.';
    }

   
    if (role === Role.ANALYST && method === 'POST') {
      return 'Analysts cannot create records. Only Admins can.';
    }

    if (role === Role.ANALYST && method === 'PATCH') {
      return 'Analysts cannot update records. Only Admins can.';
    }

    if (role === Role.ANALYST && method === 'DELETE') {
      return 'Analysts cannot delete records. Only Admins can.';
    }

    return `Your role (${role}) does not have permission to perform this action.`;
  }
}