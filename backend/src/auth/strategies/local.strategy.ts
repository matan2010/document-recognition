import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`Attempting local authentication: ${JSON.stringify({
        email,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const user = await this.authService.validateUser(email, password);
      
      if (!user) {
        this.logger.warn(`Invalid credentials for user: ${JSON.stringify({
          email,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Local authentication successful: ${JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return user;
    } catch (error) {
      this.logger.error(`Local authentication failed: ${JSON.stringify({
        email,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
}
