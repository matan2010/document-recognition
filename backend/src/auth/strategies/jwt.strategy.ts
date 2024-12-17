import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    try {
      console.log(`[JwtStrategy] Validating token payload: ${JSON.stringify(payload)}`);
      
      // Get user from database to include current role
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) {
        console.log(`[JwtStrategy] User not found for payload: ${JSON.stringify(payload)}`);
        throw new UnauthorizedException('User not found');
      }

      console.log(`[JwtStrategy] User validated: ${JSON.stringify({ 
        userId: user.id,
        email: user.email,
        role: user.role
      })}`);

      // Return user info to be added to request
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        ...payload
      };
    } catch (error) {
      console.error(`[JwtStrategy] Validation error: ${JSON.stringify({ 
        error: error.message,
        payload
      })}`);
      throw error;
    }
  }
}
