//Extends JWT authentication guard to enforce secure access control while supporting public routes,
 //and provides detailed, user-friendly error handling for invalid, expired, or missing tokens.
 
import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitingGuard implements CanActivate {
 
  private readonly rateLimitStore = new Map<string, RateLimitEntry>();
  
  // Configurable limits
  private readonly maxRequests = 100; 
  private readonly windowMs = 60000; 

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const endpoint = request.route?.path || request.url;
    const key = `${userId}:${endpoint}`;
    const now = Date.now();

    let entry = this.rateLimitStore.get(key);

  
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.rateLimitStore.set(key, entry);
      return true;
    }

    
    entry.count++;

    
    if (entry.count > this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      throw new BadRequestException(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }

    
    this.rateLimitStore.set(key, entry);

    
    this.cleanupOldEntries();

    return true;
  }

  
  private cleanupOldEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}