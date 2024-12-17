import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      console.log(`[LocalStrategy] Validating user: ${JSON.stringify({ email })}`);
      const user = await this.authService.validateUser(email, password);
      
      if (!user) {
        console.log(`[LocalStrategy] Invalid credentials for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(`[LocalStrategy] User validated successfully: ${JSON.stringify({ 
        userId: user.id,
        companyId: user.companyId
      })}`);
      
      return user;
    } catch (error) {
      console.error(`[LocalStrategy] Validation error: ${JSON.stringify({ 
        email,
        error: error.message
      })}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
