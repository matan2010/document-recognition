import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Document } from '@prisma/client';
import { IOcrService } from './interfaces/ocr.interface';
import { Inject } from '@nestjs/common';
import { JsonField } from '../common/utils/json-field.util';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileService } from './services/file.service';
import { OCR_SERVICE } from './constants';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
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

      // Process with Document AI
      const result = await this.ocrService.processDocument(filePath, 'id');
      console.log('OCR Result:', JSON.stringify(result, null, 2));

      const now = new Date().toISOString();
      
      // Create document record
      const documentMetadata = {
        confidence: result.confidence,
        processedAt: now,
        documentType: 'ID_CARD', // Since we're processing Israeli ID cards
        provider: result.metadata.provider || 'Mock OCR',
        pages: result.metadata.pages || 1,
        mimeType: result.metadata.mimeType || file.mimetype,
        structuredData: result.metadata.structuredData,
        rawResponse: result.metadata.rawResponse,
      };
      console.log('Document metadata to save:', JSON.stringify(documentMetadata, null, 2));

      const document = await this.prisma.document.create({
        data: {
          title: createDocumentDto.title || file.originalname,
          content: result.text,
          fileName: file.originalname,
          fileType: file.mimetype,
          filePath,
          fileHash: hash,
          size: file.size,
          metadata: JsonField.serialize(documentMetadata),
          client: {
            connect: {
              id: client.id,
            },
          },
          company: {
            connect: {
              id: companyId,
            },
          },
          status: 'PROCESSED',
        } as Prisma.DocumentCreateInput,
      });

      return document;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  async findAll(companyId: string): Promise<Document[]> {
    try {
      return await this.prisma.document.findMany({
        where: {
          companyId,
        },
        include: {
          client: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
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
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  }

  async findByClientId(
    clientId: string,
    companyId: string,
  ): Promise<Document[]> {
    try {
      return await this.prisma.document.findMany({
        where: {
          clientId,
          companyId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error(`Error fetching documents for client ${clientId}:`, error);
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
        where: {
          id: id,
          AND: {
            companyId: companyId,
          },
        },
        data: {
          title: updateDocumentDto.title,
          content: updateDocumentDto.content,
          metadata: JsonField.serialize({
            ...currentMetadata,
            ...updateDocumentDto.metadata,
            lastUpdated: new Date().toISOString(),
          }),
        } as Prisma.DocumentUpdateInput,
      });
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const document = await this.findOne(id, companyId);

      if (document?.filePath) {
        try {
          await this.fileService.deleteFile(document.filePath);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }

      const deletedDocument = await this.prisma.document.delete({
        where: {
          id: id,
          AND: {
            companyId: companyId,
          },
        },
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
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }

  async processDocument(
    file: Express.Multer.File,
    clientId: string,
    companyId: string,
    documentType?: string,
  ): Promise<Document> {
    try {
      // Validate file
      if (!this.fileService.isValidFile(file)) {
        throw new BadRequestException('Invalid file provided');
      }

      // Find the client first
      const client = await this.prisma.client.findFirst({
        where: {
          companyId,
          clientReferenceId: clientId,
        },
      });

      if (!client) {
        throw new NotFoundException(
          `Client with reference ID ${clientId} not found in your company`,
        );
      }

      // Save file
      const { filePath, hash } = await this.fileService.saveFile(
        file,
        companyId,
      );

      // Process with Document AI using the specified document type
      const result = await this.ocrService.processDocument(filePath, documentType);
      // console.log('OCR Result:', JSON.stringify(result, null, 2));

      const now = new Date().toISOString();
      
      // Create document record
      const documentMetadata = {
        confidence: result.confidence,
        processedAt: now,
        documentType: documentType || 'ID_CARD', // Since we're processing Israeli ID cards
        provider: result.metadata.provider || 'Mock OCR',
        pages: result.metadata.pages || 1,
        mimeType: result.metadata.mimeType || file.mimetype,
        structuredData: result.metadata.structuredData,
        rawResponse: result.metadata.rawResponse,
      };
      //console.log('Document metadata to save:', JSON.stringify(documentMetadata, null, 2));

      const document = await this.prisma.document.create({
        data: {
          title: file.originalname,
          content: result.text,
          fileName: file.originalname,
          fileType: file.mimetype,
          filePath,
          fileHash: hash,
          size: file.size,
          metadata: JsonField.serialize(documentMetadata),
          client: {
            connect: {
              id: client.id,
            },
          },
          company: {
            connect: {
              id: companyId,
            },
          },
          status: 'PROCESSED',
        } as Prisma.DocumentCreateInput,
      });

      return document;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
}
