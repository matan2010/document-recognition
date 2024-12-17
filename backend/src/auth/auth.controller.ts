import { Controller, Post, Body, Get, Request, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BootstrapDto } from './dto/bootstrap.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Company } from './decorators/company.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('bootstrap')
  async bootstrap(@Body() dto: BootstrapDto) {
    try {
      console.log(`[AuthController] Bootstrap request received: ${JSON.stringify({ dto })}`);
      const result = await this.authService.bootstrap(dto);
      console.log(`[AuthController] Company created successfully: ${JSON.stringify({ companyId: result.company.id })}`);

      return result;
    } catch (error) {
      console.error(`[AuthController] Error in bootstrap: ${JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      })}`);
      throw new InternalServerErrorException(`Failed to create company: ${error.message}`);
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() _loginDto: LoginDto) {
    try {
      console.log(`[AuthController] Login request received for user: ${JSON.stringify({ 
        userId: req.user.id,
        email: req.user.email
      })}`);
      
      const result = await this.authService.login(req.user);
      console.log(`[AuthController] Login successful for user: ${JSON.stringify({ 
        userId: req.user.id,
        email: req.user.email
      })}`);
      
      return result;
    } catch (error) {
      console.error(`[AuthController] Login error: ${JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })}`);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyToken(@Request() req, @Company() companyId: string) {
    try {
      console.log(`[AuthController] Token verified for company: ${JSON.stringify({ 
        companyId,
        user: req.user
      })}`);
      
      return {
        verified: true,
        user: {
          id: req.user.userId,
          companyId: req.user.companyId
        },
        token: {
          issuedAt: new Date(req.user.iat * 1000).toISOString(),
          expiresAt: new Date(req.user.exp * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error(`[AuthController] Error in verify: ${JSON.stringify({
        error: error.message,
        stack: error.stack
      })}`);
      throw new InternalServerErrorException('Failed to verify token');
    }
  }
}
