import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      this.logger.log(`Validating JWT payload: ${JSON.stringify({
        userId: payload.sub,
        email: payload.email,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(`User not found for JWT payload: ${JSON.stringify({
          userId: payload.sub,
          email: payload.email,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('User not found');
      }

      const result = {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      this.logger.log(`JWT validation successful: ${JSON.stringify({
        userId: result.id,
        email: result.email,
        role: result.role,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${JSON.stringify({
        userId: payload?.sub,
        email: payload?.email,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
}
