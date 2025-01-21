import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Request, 
  UseGuards, 
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BootstrapDto } from './dto/bootstrap.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('bootstrap')
  @ApiOperation({ summary: 'Bootstrap initial admin user and company' })
  @ApiResponse({ status: 201, description: 'Bootstrap successful' })
  @ApiResponse({ status: 500, description: 'Bootstrap failed' })
  async bootstrap(@Body() bootstrapDto: BootstrapDto) {
    try {
      this.logger.log('Bootstrap attempt');
      const result = await this.authService.bootstrap(bootstrapDto);
      this.logger.log('Bootstrap successful');
      return result;
    } catch (error) {
      this.logger.error('Bootstrap failed', error.stack);
      throw new InternalServerErrorException('Bootstrap failed');
    }
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            companyId: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.email}`);
    const result = await this.authService.login(req.user);
    this.logger.log(`Login successful for user: ${JSON.stringify({
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId,
      timestamp: new Date().toISOString()
    }, null, 2)}`);
    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refresh successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            companyId: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    this.logger.log('Token refresh attempt');
    const result = await this.authService.refreshToken(refreshToken);
    this.logger.log(`Token refresh successful for user: ${JSON.stringify({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      companyId: result.user.companyId,
      timestamp: new Date().toISOString()
    }, null, 2)}`);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req) {
    this.logger.log(`Logout attempt for user: ${JSON.stringify({
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId,
      timestamp: new Date().toISOString()
    }, null, 2)}`);
    await this.authService.logout(req.user.id);
    this.logger.log(`Logout successful for user ID: ${req.user.id}`);
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyToken(@Request() req) {
    try {
      this.logger.log(`Token verification for user: ${req.user.id}`);
      return {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
        companyId: req.user.companyId
      };
    } catch (error) {
      this.logger.error(`Token verification failed for user: ${req.user.id}`, error.stack);
      throw error;
    }
  }
}
