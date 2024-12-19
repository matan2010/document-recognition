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
    BadRequestException,
    ParseFilePipeBuilder,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../decorators/company.decorator';
import { Express } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(pdf|jpg|jpeg|png|tiff)$/,
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) file: Express.Multer.File,
        @Body() createDocumentDto: CreateDocumentDto,
        @Company() companyId: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        console.log('[DocumentsController] Creating document for company:', { companyId });
        return this.documentsService.create(file, createDocumentDto, companyId);
    }

    @Get()
    findAll(@Company() companyId: string) {
        console.log('[DocumentsController] Finding all documents for company:', { companyId });
        return this.documentsService.findAll(companyId);
    }

    @Get(':id')
    findOne(@Company() companyId: string, @Param('id') id: string) {
        console.log('[DocumentsController] Finding document for company:', { companyId, documentId: id });
        return this.documentsService.findOne(id, companyId);
    }

    @Patch(':id')
    update(
        @Company() companyId: string,
        @Param('id') id: string,
        @Body() updateDocumentDto: UpdateDocumentDto
    ) {
        console.log('[DocumentsController] Updating document for company:', { companyId, documentId: id });
        return this.documentsService.update(id, updateDocumentDto, companyId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a document' })
    @ApiResponse({ 
      status: 200, 
      description: 'Document deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Document deleted successfully' },
          deletedDocument: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              title: { type: 'string', example: 'Israeli ID Card' },
              fileName: { type: 'string', example: 'id-card.jpg' },
              client: {
                type: 'object',
                properties: {
                  clientReferenceId: { type: 'string', example: 'CLIENT001' },
                  name: { type: 'string', example: 'John Doe' }
                }
              },
              deletedAt: { type: 'string', example: '2024-12-19T18:06:39.000Z' }
            }
          }
        }
      }
    })
    @ApiResponse({ status: 404, description: 'Document not found or does not belong to your company' })
    @ApiResponse({ status: 400, description: 'Failed to delete document' })
    remove(@Param('id') id: string, @Company() companyId: string) {
      console.log('[DocumentsController] Removing document for company:', { companyId, documentId: id });
      return this.documentsService.remove(id, companyId);
    }
}
