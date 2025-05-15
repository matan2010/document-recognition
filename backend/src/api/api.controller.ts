import {
  Controller,
  Get,
  Param,
  UseGuards,
  Logger,
  Request,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../auth/decorators/company.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(private readonly apiService: ApiService) {}

  @Get('clients')
  @ApiOperation({ summary: 'Get all clients with their documents' })
  @ApiResponse({
    status: 200,
    description: 'List of clients with their documents',
  })
  async getAllClientsWithDocuments(
    @Request() req,
    @Company() companyId: string,
  ) {
    try {
      this.logger.log(
        `Fetching all clients with documents for company: ${JSON.stringify(
          {
            companyId,
            requestedBy: req.user.id,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const result = await this.apiService.getClientsWithDocuments(companyId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch clients with documents: ${JSON.stringify(
          {
            companyId,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Get client with documents by ID' })
  @ApiResponse({ status: 200, description: 'Client with documents found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getClientWithDocuments(
    @Request() req,
    @Company() companyId: string,
    @Param('id') id: string,
  ) {
    try {
      this.logger.log(
        `Fetching client with documents: ${JSON.stringify(
          {
            id,
            companyId,
            requestedBy: req.user.id,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const result = await this.apiService.getClientWithDocuments(
        id,
        companyId,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch client with documents: ${JSON.stringify(
          {
            id,
            companyId,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('dashboard/client/:id')
  @ApiOperation({ summary: 'Get client dashboard data' })
  @ApiResponse({ status: 200, description: 'Client dashboard data retrieved' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getClientDashboard(
    @Request() req,
    @Company() companyId: string,
    @Param('id') id: string,
  ) {
    try {
      this.logger.log(
        `Fetching client dashboard: ${JSON.stringify(
          {
            id,
            companyId,
            requestedBy: req.user.id,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const result = await this.apiService.getClientDashboard(id, companyId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch client dashboard: ${JSON.stringify(
          {
            id,
            companyId,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('dashboard/company')
  @ApiOperation({ summary: 'Get company dashboard data' })
  @ApiResponse({ status: 200, description: 'Company dashboard data retrieved' })
  async getCompanyDashboard(@Request() req, @Company() companyId: string) {
    try {
      this.logger.log(
        `Fetching company dashboard: ${JSON.stringify(
          {
            companyId,
            requestedBy: req.user.id,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const result = await this.apiService.getCompanyDashboard(companyId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch company dashboard: ${JSON.stringify(
          {
            companyId,
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
        error.stack,
      );
      throw error;
    }
  }
}
