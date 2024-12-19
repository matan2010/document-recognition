import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../auth/decorators/company.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 409, description: 'Client with this reference ID already exists in your company' })
  create(@Company() companyId: string, @Body() createClientDto: CreateClientDto) {
    console.log('[ClientsController] Creating client for company:', { companyId });
    return this.clientsService.create(createClientDto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients for the company' })
  findAll(@Company() companyId: string) {
    console.log('[ClientsController] Finding all clients for company:', { companyId });
    return this.clientsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  findOne(@Param('id') id: string, @Company() companyId: string) {
    console.log('[ClientsController] Finding client for company:', { companyId, clientId: id });
    return this.clientsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Company() companyId: string,
  ) {
    console.log('[ClientsController] Updating client for company:', { companyId, clientId: id });
    return this.clientsService.update(id, updateClientDto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  remove(@Param('id') id: string, @Company() companyId: string) {
    console.log('[ClientsController] Removing client for company:', { companyId, clientId: id });
    return this.clientsService.remove(id, companyId);
  }
}
