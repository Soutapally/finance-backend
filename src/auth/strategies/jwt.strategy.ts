//Implements JWT-based authentication strategy by validating tokens and ensuring
 //only active and authorized users can access protected resources.
 
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super-secret-key'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    
    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException('User is no longer active');
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isActive: payload.isActive,
    };
  }
}