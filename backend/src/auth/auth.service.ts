import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import { BootstrapDto } from './dto/bootstrap.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`Validating user: ${email}`);
      
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...result } = user;
      this.logger.log(`User validated successfully: ${email}`);
      return result;
    } catch (error) {
      this.logger.error(`Validation error for ${email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: any) {
    try {
      this.logger.log(`Generating tokens for user: ${user.email}`);
      const tokens = await this.generateTokens(user);
      await this.saveRefreshToken(user.id, tokens.refresh_token);
      
      this.logger.log(`Login successful for user: ${user.email}`);
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      };
    } catch (error) {
      this.logger.error(`Login error for ${user.email}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      this.logger.log('Validating refresh token');
      const savedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!savedToken || savedToken.revokedAt || savedToken.expiresAt < new Date()) {
        this.logger.warn('Invalid refresh token attempted');
        throw new UnauthorizedException('Invalid refresh token');
      }

      this.logger.log(`Generating new tokens for user: ${savedToken.user.email}`);
      const tokens = await this.generateTokens(savedToken.user);

      // Revoke old token and create new one in a transaction
      await this.prisma.$transaction([
        this.prisma.refreshToken.update({
          where: { id: savedToken.id },
          data: { revokedAt: new Date() },
        }),
        this.prisma.refreshToken.create({
          data: {
            token: tokens.refresh_token,
            userId: savedToken.user.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        }),
      ]);

      this.logger.log(`Token refresh successful for user: ${savedToken.user.email}`);
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: savedToken.user.id,
          email: savedToken.user.email,
          role: savedToken.user.role,
          companyId: savedToken.user.companyId
        }
      };
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      this.logger.log(`Revoking all refresh tokens for user: ${userId}`);
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
      this.logger.log(`Successfully revoked all refresh tokens for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Logout error for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async bootstrap(dto: BootstrapDto) {
    try {
      this.logger.log('Starting bootstrap process');
      
      const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
      
      const company = await this.prisma.company.create({
        data: {
          name: dto.companyName,
          users: {
            create: {
              email: dto.adminEmail,
              password: hashedPassword,
              role: Role.ADMIN,
            },
          },
        },
        include: {
          users: true,
        },
      });

      const user = company.users[0];
      const { password: _, ...userWithoutPassword } = user;
      
      this.logger.log(`Bootstrap successful. Company created: ${company.id}`);
      const token = await this.login(userWithoutPassword);
      
      return {
        company: {
          id: company.id,
          name: company.name,
        },
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        ...token,
      };
    } catch (error) {
      this.logger.error(`Bootstrap error: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to create company');
    }
  }

  private async generateTokens(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      companyId: user.companyId,
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: uuidv4(),
    };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    } catch (error) {
      this.logger.error(`Failed to save refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }
}
