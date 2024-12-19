import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../auth/decorators/company.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload and create a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
        clientId: {
          type: 'string',
          description: 'Client reference ID',
        },
        title: {
          type: 'string',
          description: 'Document title',
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata',
          additionalProperties: true,
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Document created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'Israeli ID Card' },
        clientId: { type: 'string', example: 'CLIENT001' },
        status: { type: 'string', example: 'PENDING' },
        filePath: { type: 'string', example: 'uploads/2024/01/document.pdf' },
        metadata: { 
          type: 'object',
          example: {
            documentType: 'ID_CARD',
            issueDate: '2024-01-19'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid document data or file' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Company() companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    try {
      this.logger.log(`Creating document: ${JSON.stringify({
        companyId,
        clientId: createDocumentDto.clientId,
        title: createDocumentDto.title,
        fileName: file?.originalname,
        fileSize: file?.size,
        mimeType: file?.mimetype,
        metadata: createDocumentDto.metadata,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.documentsService.create(file, createDocumentDto, companyId);
      
      this.logger.log(`Document created successfully: ${JSON.stringify({
        id: result.id,
        title: result.title,
        clientId: result.clientId,
        fileName: result.fileName,
        filePath: result.filePath,
        status: result.status,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to create document: ${JSON.stringify({
        companyId,
        clientId: createDocumentDto.clientId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for company' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of documents',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'string' },
          clientId: { type: 'string' },
          content: { type: 'string' },
          metadata: { type: 'object' }
        }
      }
    }
  })
  async findAll(@Company() companyId: string) {
    try {
      this.logger.log(`Fetching all documents for company: ${JSON.stringify({
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const documents = await this.documentsService.findAll(companyId);
      
      this.logger.log(`Successfully retrieved ${documents.length} documents for company: ${JSON.stringify({
        companyId,
        count: documents.length,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return documents;
    } catch (error) {
      this.logger.error(`Failed to fetch documents: ${JSON.stringify({
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(`Fetching document: ${JSON.stringify({
        id,
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const document = await this.documentsService.findOne(id, companyId);
      
      this.logger.log(`Document retrieved successfully: ${JSON.stringify({
        id: document.id,
        title: document.title,
        clientId: document.clientId,
        status: document.status,
        fileName: document.fileName,
        companyId: document.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return document;
    } catch (error) {
      this.logger.error(`Failed to fetch document: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(
    @Company() companyId: string,
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    try {
      this.logger.log(`Updating document: ${JSON.stringify({
        id,
        companyId,
        updates: updateDocumentDto,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.documentsService.update(id, updateDocumentDto, companyId);
      
      this.logger.log(`Document updated successfully: ${JSON.stringify({
        id: result.id,
        title: result.title,
        clientId: result.clientId,
        status: result.status,
        companyId: result.companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to update document: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ 
    status: 200, 
    description: 'Document deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Document deleted successfully' },
        deletedDocument: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            clientId: { type: 'string' },
            status: { type: 'string' },
            companyId: { type: 'string' },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async remove(@Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(`Deleting document: ${JSON.stringify({
        id,
        companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      const result = await this.documentsService.remove(id, companyId);
      
      this.logger.log(`Document deleted successfully: ${JSON.stringify({
        id: result.deletedDocument.id,
        title: result.deletedDocument.title,
        clientId: result.deletedDocument.client.clientReferenceId,
        companyId: companyId,
        timestamp: new Date().toISOString()
      }, null, 2)}`);

      return {
        success: true,
        message: 'Document deleted successfully',
        deletedDocument: {
          ...result,
          deletedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Failed to delete document: ${JSON.stringify({
        id,
        companyId,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2)}`, error.stack);
      throw error;
    }
  }
}
