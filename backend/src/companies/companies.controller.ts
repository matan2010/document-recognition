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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../decorators/company.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  private readonly logger = new Logger(CompaniesController.name);

  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid company data' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async create(@Request() req, @Body() createCompanyDto: CreateCompanyDto) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized company creation attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can create companies');
      }

      this.logger.log(`Creating company: ${JSON.stringify({
        name: createCompanyDto.name,
        createdBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.companiesService.create(createCompanyDto, req.user.id);
      
      this.logger.log(`Company created successfully: ${JSON.stringify({
        id: result.id,
        name: result.name,
        createdBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to create company: ${JSON.stringify({
        name: createCompanyDto.name,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'List of companies' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async findAll(@Request() req) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized companies list attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can list all companies');
      }

      this.logger.log(`Fetching all companies: ${JSON.stringify({
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const companies = await this.companiesService.findAll();
      
      this.logger.log(`Successfully retrieved ${companies.length} companies: ${JSON.stringify({
        count: companies.length,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return companies;
    } catch (error) {
      this.logger.error(`Failed to fetch companies: ${JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current user\'s company' })
  @ApiResponse({ status: 200, description: 'Company found' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findCurrent(@Request() req, @Company() companyId: string) {
    try {
      this.logger.log(`Fetching current company: ${JSON.stringify({
        companyId,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const company = await this.companiesService.findOne(companyId);
      
      this.logger.log(`Current company retrieved successfully: ${JSON.stringify({
        id: company.id,
        name: company.name,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return company;
    } catch (error) {
      this.logger.error(`Failed to fetch current company: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company found' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async findOne(@Request() req, @Param('id') id: string) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized company access attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          companyId: id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can access other companies');
      }

      this.logger.log(`Fetching company: ${JSON.stringify({
        id,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const company = await this.companiesService.findOne(id);
      
      this.logger.log(`Company retrieved successfully: ${JSON.stringify({
        id: company.id,
        name: company.name,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return company;
    } catch (error) {
      this.logger.error(`Failed to fetch company: ${JSON.stringify({
        id,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Patch('current')
  @ApiOperation({ summary: 'Update current user\'s company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async updateCurrent(
    @Request() req,
    @Company() companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    try {
      this.logger.log(`Updating current company: ${JSON.stringify({
        companyId,
        updates: updateCompanyDto,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.companiesService.update(companyId, updateCompanyDto);
      
      this.logger.log(`Current company updated successfully: ${JSON.stringify({
        id: result.id,
        name: result.name,
        updatedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to update current company: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized company update attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          companyId: id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can update companies');
      }

      this.logger.log(`Updating company: ${JSON.stringify({
        id,
        updates: updateCompanyDto,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.companiesService.update(id, updateCompanyDto);
      
      this.logger.log(`Company updated successfully: ${JSON.stringify({
        id: result.id,
        name: result.name,
        updatedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to update company: ${JSON.stringify({
        id,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Delete('current')
  @ApiOperation({ summary: 'Delete current user\'s company' })
  @ApiResponse({ 
    status: 200, 
    description: 'Company deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Company deleted successfully' },
        deletedCompany: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async removeCurrent(@Request() req, @Company() companyId: string) {
    try {
      this.logger.log(`Deleting current company: ${JSON.stringify({
        companyId,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.companiesService.remove(companyId);
      
      this.logger.log(`Current company deleted successfully: ${JSON.stringify({
        id: result.deletedCompany.id,
        name: result.deletedCompany.name,
        deletedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return {
        success: true,
        message: 'Company deleted successfully',
        deletedCompany: {
          ...result.deletedCompany,
          deletedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete current company: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ 
    status: 200, 
    description: 'Company deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Company deleted successfully' },
        deletedCompany: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  async remove(@Request() req, @Param('id') id: string) {
    try {
      if (req.user.role !== 'admin') {
        this.logger.warn(`Unauthorized company deletion attempt: ${JSON.stringify({
          userId: req.user.id,
          role: req.user.role,
          companyId: id,
          timestamp: new Date().toISOString()
        }, null, 2)}`);
        throw new UnauthorizedException('Only admin users can delete companies');
      }

      this.logger.log(`Deleting company: ${JSON.stringify({
        id,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.companiesService.remove(id);
      
      this.logger.log(`Company deleted successfully: ${JSON.stringify({
        id: result.deletedCompany.id,
        name: result.deletedCompany.name,
        deletedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return {
        success: true,
        message: 'Company deleted successfully',
        deletedCompany: {
          ...result.deletedCompany,
          deletedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete company: ${JSON.stringify({
        id,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
}
