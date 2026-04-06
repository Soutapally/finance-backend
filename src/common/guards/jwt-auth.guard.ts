//Extends JWT authentication guard to enforce secure access control while supporting public routes,
//and provides detailed, user-friendly error handling for invalid, expired, or missing tokens.

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    if (err || !user) {
     
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Invalid or malformed authentication token.',
          error: 'Unauthorized',
          requiredAction: 'Please provide a valid JWT token in Authorization header',
          example: 'Authorization: Bearer your_jwt_token_here',
        });
      }
      
     
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Your session has expired. Please login again.',
          error: 'Unauthorized',
          requiredAction: 'Please login to get a new token',
          endpoint: 'POST /auth/login',
        });
      }
      
      
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Authentication required to access this endpoint.',
        error: 'Unauthorized',
        requiredAction: 'Please login first',
        publicEndpoints: ['POST /users', 'POST /auth/login'],
      });
    }
    
    return user;
  }
}