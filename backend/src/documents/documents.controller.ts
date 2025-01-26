import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Patch,
  Logger,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../auth/decorators/company.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateDocumentDto } from './dto/update-document.dto';

/**
 * Documents Controller
 *
 * Handles CRUD operations for documents
 */
@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload and process document with Google Cloud Vision
   *
   * @param companyId Company ID
   * @param file Uploaded file
   * @param clientId Client ID
   */
  @Post('upload/:clientId')
  @ApiOperation({
    summary: 'Upload and process document with Google Cloud Vision',
  })
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
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded and processed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid document data or file' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Company() companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Param('clientId') clientId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF, JPEG, and PNG files are allowed',
      );
    }

    try {
      this.logger.log(
        `Uploading and processing document: ${JSON.stringify(
          {
            companyId,
            clientId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const result = await this.documentsService.processDocument(
        file,
        clientId,
        companyId,
      );

      this.logger.log(
        `Document uploaded and processed successfully: ${JSON.stringify(
          {
            id: result.id,
            title: result.title,
            clientId: result.clientId,
            status: result.status,
            companyId: result.companyId,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upload and process document: ${JSON.stringify(
          {
            companyId,
            clientId,
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

  /**
   * Get all documents for company
   *
   * @param companyId Company ID
   */
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
          metadata: { type: 'object' },
        },
      },
    },
  })
  async findAll(@Company() companyId: string) {
    try {
      this.logger.log(
        `Fetching all documents for company: ${JSON.stringify(
          {
            companyId,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const documents = await this.documentsService.findAll(companyId);

      this.logger.log(
        `Successfully retrieved ${documents.length} documents for company: ${JSON.stringify(
          {
            companyId,
            count: documents.length,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      return documents;
    } catch (error) {
      this.logger.error(
        `Failed to fetch documents: ${JSON.stringify(
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

  /**
   * Get document by ID
   *
   * @param companyId Company ID
   * @param id Document ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(
        `Fetching document: ${JSON.stringify(
          {
            id,
            companyId,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const document = await this.documentsService.findOne(id, companyId);

      this.logger.log(
        `Document retrieved successfully: ${JSON.stringify(
          {
            id: document.id,
            title: document.title,
            clientId: document.clientId,
            status: document.status,
            companyId: document.companyId,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      return document;
    } catch (error) {
      this.logger.error(
        `Failed to fetch document: ${JSON.stringify(
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

  /**
   * Get documents by client ID
   *
   * @param companyId Company ID
   * @param clientId Client ID
   */
  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get documents by client ID' })
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
          metadata: { type: 'object' },
        },
      },
    },
  })
  async findByClientId(
    @Company() companyId: string,
    @Param('clientId') clientId: string,
  ) {
    try {
      this.logger.log(
        `Fetching documents for client: ${JSON.stringify(
          {
            companyId,
            clientId,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      const documents = await this.documentsService.findByClientId(
        clientId,
        companyId,
      );

      this.logger.log(
        `Successfully retrieved ${documents.length} documents for client: ${JSON.stringify(
          {
            companyId,
            clientId,
            count: documents.length,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        )}`,
      );

      return documents;
    } catch (error) {
      this.logger.error(
        `Failed to fetch documents: ${JSON.stringify(
          {
            companyId,
            clientId,
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

  /**
   * Update document
   *
   * @param id Document ID
   * @param updateDocumentDto Update document DTO
   * @param req Request
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    try {
      const companyId = req.user.companyId;

      this.logger.log(
        `Updating document: ${JSON.stringify({
          id,
          companyId,
          updates: updateDocumentDto,
          timestamp: new Date().toISOString(),
        }, null, 2)}`,
      );

      const result = await this.documentsService.update(
        id,
        updateDocumentDto,
        companyId,
      );

      this.logger.log(
        `Document updated successfully: ${JSON.stringify({
          id: result.id,
          title: result.title,
          clientId: result.clientId,
          status: result.status,
          companyId: result.companyId,
          timestamp: new Date().toISOString(),
        }, null, 2)}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update document: ${JSON.stringify({
          id,
          companyId: req.user.companyId,
          error: error.message,
          timestamp: new Date().toISOString(),
        }, null, 2)}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete document
   *
   * @param companyId Company ID
   * @param id Document ID
   */
  @Delete(':id')
  async remove(@Company() companyId: string, @Param('id') id: string) {
    try {
      this.logger.log(
        `Deleting document: ${JSON.stringify({
          id,
          companyId,
        })}`,
      );

      const result = await this.documentsService.remove(id, companyId);

      this.logger.log(
        `Document deleted successfully: ${JSON.stringify({
          id: result.deletedDocument.id,
          title: result.deletedDocument.title,
          client: result.deletedDocument.client,
          companyId: companyId,
          timestamp: new Date().toISOString(),
        })}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
}
