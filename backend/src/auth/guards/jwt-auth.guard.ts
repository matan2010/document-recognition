import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow public routes without authentication
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    try {
      const isValid = await super.canActivate(context);
      
      if (isValid) {
        console.log(`[JwtAuthGuard] Request validated: ${JSON.stringify({ 
          path: request.path,
          method: request.method,
          user: request.user
        })}`);

        return true;  

      } else {
        console.log(`[JwtAuthGuard] Request not validated: ${JSON.stringify({ 
          path: request.path,
          method: request.method
        })}`);

        return false;
      }
      
    } catch (error) {
      console.error(`[JwtAuthGuard] Validation error: ${JSON.stringify({
        path: request.path,
        method: request.method,
        error: error.message
      })}`);
      throw error;
    }
  }
}
