import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BootstrapDto } from './dto/bootstrap.dto';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log(`[AuthService] Validating user: ${JSON.stringify({ email })}`);
      
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log(`[AuthService] User not found: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log(`[AuthService] Invalid password for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...result } = user;
      console.log(`[AuthService] User validated successfully: ${JSON.stringify({ 
        userId: result.id,
        companyId: result.companyId
      })}`);
      
      return result;
    } catch (error) {
      console.error(`[AuthService] Validation error: ${JSON.stringify({ 
        email,
        error: error.message
      })}`);
      throw error;
    }
  }

  async login(user: any) {
    try {
      console.log(`[AuthService] Generating JWT token for user: ${JSON.stringify({ 
        userId: user.id,
        companyId: user.companyId
      })}`);
      
      const payload = { 
        email: user.email, 
        sub: user.id,
        role: user.role,
        companyId: user.companyId
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        }
      };
    } catch (error) {
      console.error(`[AuthService] Login error: ${JSON.stringify({ 
        userId: user.id,
        error: error.message
      })}`);
      throw new UnauthorizedException('Failed to generate token');
    }
  }

  async bootstrap(dto: BootstrapDto) {
    try {
      console.log('[AuthService] Starting bootstrap process');
      
      // Check if company already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.adminEmail }
      });

      if (existingUser) {
        throw new UnauthorizedException('User already exists');
      }

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
      
      console.log(`[AuthService] Bootstrap successful: ${JSON.stringify({ 
        companyId: company.id,
        userId: user.id
      })}`);

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
      console.error(`[AuthService] Bootstrap error: ${JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })}`);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to create company');
    }
  }
}
