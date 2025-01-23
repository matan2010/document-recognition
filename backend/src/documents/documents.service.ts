import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document, Prisma } from '@prisma/client';
import { FileService } from './services/file.service';
import { IOcrService } from './interfaces/ocr.interface';
import { OCR_SERVICE } from './providers/ocr.provider';
import { JsonField } from '../common/utils/json-field.util';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
    @Inject(OCR_SERVICE) private ocrService: IOcrService,
  ) {}

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    companyId: string,
  ): Promise<Document> {
    try {
      this.logger.log(`Creating document for company: ${companyId}`);

      // Validate file
      if (!this.fileService.isValidFile(file)) {
        throw new BadRequestException('Invalid file provided');
      }

      // Find the client first
      const client = await this.prisma.client.findFirst({
        where: {
          companyId,
          clientReferenceId: createDocumentDto.clientId,
        },
      });

      if (!client) {
        throw new NotFoundException(
          `Client with reference ID ${createDocumentDto.clientId} not found in your company`,
        );
      }

      // Save file
      const { filePath, hash } = await this.fileService.saveFile(
        file,
        companyId,
      );

      // Create document record
      const document = await this.prisma.document.create({
        data: {
          title: createDocumentDto.title || file.originalname,
          content: '', // Will be updated after OCR
          fileName: file.originalname,
          fileType: file.mimetype,
          filePath,
          fileHash: hash,
          status: 'PENDING',
          metadata: JsonField.serialize({}),
          client: {
            connect: {
              id: client.id, // Use the MongoDB ID we got from finding the client
            },
          },
          company: {
            connect: {
              id: companyId,
            },
          },
        } as Prisma.DocumentCreateInput,
      });

      // Process document with OCR asynchronously
      await this.processDocumentAsync(document.id, filePath);

      return document;
    } catch (error) {
      this.logger.error(
        `Failed to create document: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async processDocumentAsync(
    documentId: string,
    filePath: string,
  ): Promise<void> {
    try {
      // Get current document to access existing metadata
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      const currentMetadata =
        JsonField.deserialize<Record<string, any>>(document?.metadata) || {};

      // Update status to processing
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'PROCESSING',
          metadata: JsonField.serialize({
            ...currentMetadata,
            processingStartedAt: new Date().toISOString(),
          }),
        } as Prisma.DocumentUpdateInput,
      });

      // Process with OCR
      const ocrResult = await this.ocrService.processDocument(filePath);

      // Update document with OCR results
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          content: ocrResult.text,
          status: 'COMPLETED',
          metadata: JsonField.serialize({
            ...currentMetadata,
            confidence: ocrResult.confidence,
            processingCompletedAt: new Date().toISOString(),
            ...ocrResult.metadata,
          }),
        } as Prisma.DocumentUpdateInput,
      });

      this.logger.log(`Document processed successfully: ${documentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process document: ${documentId}`,
        error.stack,
      );

      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      const currentMetadata =
        JsonField.deserialize<Record<string, any>>(document?.metadata) || {};

      // Update error status
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'ERROR',
          metadata: JsonField.serialize({
            ...currentMetadata,
            error: error.message,
            processingError: true,
            processingErrorAt: new Date().toISOString(),
          }),
        } as Prisma.DocumentUpdateInput,
      });
    }
  }

  async findAll(companyId: string): Promise<Document[]> {
    try {
      return await this.prisma.document.findMany({
        where: { companyId },
        include: {
          client: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find documents: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string, companyId: string): Promise<Document> {
    try {
      const document = await this.prisma.document.findFirst({
        where: {
          id,
          companyId,
        },
        include: {
          client: true,
        },
      });

      if (!document) {
        throw new NotFoundException(`Document not found`);
      }

      return document;
    } catch (error) {
      this.logger.error(
        `Failed to find document: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    companyId: string,
  ): Promise<Document> {
    try {
      const document = await this.findOne(id, companyId);

      const currentMetadata =
        JsonField.deserialize<Record<string, any>>(document.metadata) || {};

      return await this.prisma.document.update({
        where: { id },
        data: {
          content: updateDocumentDto.content,
          title: updateDocumentDto.title,
          metadata: JsonField.serialize({
            ...currentMetadata,
            ...updateDocumentDto.metadata,
            lastUpdated: new Date().toISOString(),
          }),
        } as Prisma.DocumentUpdateInput,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update document: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      // First verify document exists and belongs to company
      const document = await this.findOne(id, companyId);

      // Delete file if it exists
      if (document.filePath) {
        try {
          await this.fileService.deleteFile(document.filePath);
        } catch (error) {
          this.logger.warn(
            `Failed to delete file for document ${id}: ${error.message}`,
          );
          // Continue with document deletion even if file deletion fails
        }
      }

      // Delete document record
      const deletedDocument = await this.prisma.document.delete({
        where: { id },
        include: {
          client: {
            select: {
              clientReferenceId: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Document deleted successfully',
        deletedDocument: {
          id: deletedDocument.id,
          title: deletedDocument.title,
          fileName: deletedDocument.fileName,
          client: deletedDocument.client,
          deletedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete document: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to delete document: ${error.message}`,
      );
    }
  }
}
