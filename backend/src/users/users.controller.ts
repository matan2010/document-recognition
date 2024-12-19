import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Logger,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../decorators/company.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async create(@Request() req, @Company() companyId: string, @Body() createUserDto: CreateUserDto) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized user creation attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can create new users');
      }

      this.logger.log(`Creating user: ${JSON.stringify({
        companyId,
        email: createUserDto.email,
        role: createUserDto.role,
        createdBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.usersService.create(createUserDto, companyId);
      
      this.logger.log(`User created successfully: ${JSON.stringify({
        id: result.id,
        email: result.email,
        role: result.role,
        companyId: result.companyId,
        createdBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to create user: ${JSON.stringify({
        companyId,
        email: createUserDto.email,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async findAll(@Request() req, @Company() companyId: string) {
    try {
      let users;
      if (req.user.role === 'admin') {
        this.logger.log(`Admin fetching all users: ${JSON.stringify({
          adminId: req.user.id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        users = await this.usersService.findAll();
      } else {
        this.logger.log(`Fetching company users: ${JSON.stringify({
          companyId,
          requestedBy: req.user.id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        users = await this.usersService.findAllByCompany(companyId);
      }
      
      this.logger.log(`Successfully retrieved ${users.length} users: ${JSON.stringify({
        count: users.length,
        requestedBy: req.user.id,
        role: req.user.role,
        companyId: req.user.role === 'admin' ? 'all' : companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return users;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

   @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile found' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async getProfile(@Request() req, @Company() companyId: string) {
    try {
      this.logger.log(`Fetching user profile: ${JSON.stringify({
        userId: req.user.id,
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const user = await this.usersService.findOne(req.user.id, companyId);
      
      this.logger.log(`Profile retrieved successfully: ${JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch profile: ${JSON.stringify({
        userId: req.user.id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async findOne(@Request() req, @Company() companyId: string, @Param('id') id: string) {
    try {
      // Check if user has access to view this user
      if (req.user.role !== 'admin' && id !== req.user.id && req.user.companyId !== companyId) {
        this.logger.warn(`Unauthorized user access attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          requestedUserId: id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('You can only view your own profile or users in your company');
      }

      this.logger.log(`Fetching user: ${JSON.stringify({
        id,
        companyId,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const user = await this.usersService.findOne(id, companyId);
      
      this.logger.log(`User retrieved successfully: ${JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }





  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async updateProfile(
    @Request() req,
    @Company() companyId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      // Prevent users from changing their own role
      if (updateUserDto.role) {
        this.logger.warn(`Unauthorized role update attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          attemptedRole: updateUserDto.role,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Users cannot change their own role');
      }

      this.logger.log(`Updating user profile: ${JSON.stringify({
        userId: req.user.id,
        companyId,
        updates: updateUserDto,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.usersService.update(req.user.id, updateUserDto, companyId);
      
      this.logger.log(`Profile updated successfully: ${JSON.stringify({
        id: result.id,
        email: result.email,
        role: result.role,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to update profile: ${JSON.stringify({
        userId: req.user.id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
  
  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access' })
  async update(
    @Request() req,
    @Company() companyId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      // Check if user has permission to update
      if (req.user.role !== 'admin' && id !== req.user.id) {
        this.logger.warn(`Unauthorized user update attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          targetUserId: id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('You can only update your own profile');
      }

      // Prevent non-admins from changing roles
      if (req.user.role !== 'admin' && updateUserDto.role) {
        this.logger.warn(`Unauthorized role update attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          attemptedRole: updateUserDto.role,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admins can change user roles');
      }

      this.logger.log(`Updating user: ${JSON.stringify({
        id,
        companyId,
        updates: updateUserDto,
        updatedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.usersService.update(id, updateUserDto, companyId);
      
      this.logger.log(`User updated successfully: ${JSON.stringify({
        id: result.id,
        email: result.email,
        role: result.role,
        companyId: result.companyId,
        updatedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to update user: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User deleted successfully' },
        deletedUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            companyId: { type: 'string' },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async remove(@Request() req, @Company() companyId: string, @Param('id') id: string) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized user deletion attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          targetUserId: id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can delete users');
      }

      this.logger.log(`Deleting user: ${JSON.stringify({
        id,
        companyId,
        deletedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.usersService.remove(id, companyId);
      
      this.logger.log(`User deleted successfully: ${JSON.stringify({
        id: result.deletedUser.id,
        email: result.deletedUser.email,
        role: result.deletedUser.role,
        companyId: companyId,
        deletedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return {
        success: true,
        message: 'User deleted successfully',
        deletedUser: {
          ...result.deletedUser,
          deletedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete user: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
}
