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
  Request
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../auth/decorators/company.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ 
    status: 201, 
    description: 'Client created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        clientReferenceId: { type: 'string', example: 'CLIENT001' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        companyId: { type: 'string', example: '507f1f77bcf86cd799439012' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid client data' })
  @ApiResponse({ status: 409, description: 'Client reference ID already exists' })
  async create(@Company() companyId: string, @Body() createClientDto: CreateClientDto) {
    try {
      this.logger.log(`Creating client: ${JSON.stringify({
        companyId,
        clientReferenceId: createClientDto.clientReferenceId,
        name: createClientDto.name,
        email: createClientDto.email,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.clientsService.create(createClientDto, companyId);
      
      this.logger.log(`Client created successfully: ${JSON.stringify({
        id: result.id,
        clientReferenceId: result.clientReferenceId,
        name: result.name,
        email: result.email,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to create client: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for company' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of clients',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          clientReferenceId: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          companyId: { type: 'string' }
        }
      }
    }
  })
  async findAll(@Company() companyId: string) {
    try {
      this.logger.log(`Fetching all clients for company: ${JSON.stringify({
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const clients = await this.clientsService.findAll(companyId);
      
      this.logger.log(`Successfully retrieved ${clients.length} clients for company: ${JSON.stringify({
        companyId,
        count: clients.length,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return clients;
    } catch (error) {
      this.logger.error(`Failed to fetch clients: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200, description: 'Client found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async findOne(@Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(`Fetching client: ${JSON.stringify({
        id,
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const client = await this.clientsService.findOne(id, companyId);
      
      this.logger.log(`Client retrieved successfully: ${JSON.stringify({
        id: client.id,
        clientReferenceId: client.clientReferenceId,
        name: client.name,
        email: client.email,
        companyId: client.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return client;
    } catch (error) {
      this.logger.error(`Failed to fetch client: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get client documents' })
  @ApiResponse({ status: 200, description: 'Documents found' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getClientDocuments(@Request() req, @Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(`Fetching documents for client: ${JSON.stringify({
        clientId: id,
        companyId,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const documents = await this.clientsService.findClientDocuments(id, companyId);
      
      this.logger.log(`Documents retrieved successfully: ${JSON.stringify({
        clientId: id,
        documentCount: documents.length,
        requestedBy: req.user.id,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return documents;
    } catch (error) {
      this.logger.error(`Failed to fetch client documents: ${JSON.stringify({
        clientId: id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 409, description: 'Client reference ID already exists' })
  async update(
    @Company() companyId: string,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    try {
      this.logger.log(`Updating client: ${JSON.stringify({
        id,
        companyId,
        updates: updateClientDto,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.clientsService.update(id, updateClientDto, companyId);
      
      this.logger.log(`Client updated successfully: ${JSON.stringify({
        id: result.id,
        clientReferenceId: result.clientReferenceId,
        name: result.name,
        email: result.email,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to update client: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({ 
    status: 200, 
    description: 'Client deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Client deleted successfully' },
        deletedClient: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            clientReferenceId: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            companyId: { type: 'string' },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async remove(@Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(`Deleting client: ${JSON.stringify({
        id,
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.clientsService.remove(id, companyId);
      
      this.logger.log(`Client deleted successfully: ${JSON.stringify({
        id: result.id,
        clientReferenceId: result.clientReferenceId,
        name: result.name,
        email: result.email,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return {
        success: true,
        message: 'Client deleted successfully',
        deletedClient: {
          ...result,
          deletedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete client: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
}
