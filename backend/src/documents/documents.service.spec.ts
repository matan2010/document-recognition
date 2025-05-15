import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from './services/file.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OCR_SERVICE } from './constants';
import { Document } from '@prisma/client';

// Mock implementations
const mockPrismaService = {
  client: {
    findFirst: jest.fn(),
  },
  document: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

const mockFileService = {
  isValidFile: jest.fn(),
  saveFile: jest.fn(),
  deleteFile: jest.fn(),
};

const mockOcrService = {
  processDocument: jest.fn(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaService: PrismaService;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FileService,
          useValue: mockFileService,
        },
        {
          provide: OCR_SERVICE,
          useValue: mockOcrService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    fileService = module.get<FileService>(FileService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    const mockCreateDocumentDto = {
      title: 'Test Document',
      clientId: 'client123',
    };

    const mockCompanyId = 'company123';

    it('should create a document successfully', async () => {
      // Arrange
      const mockClient = { id: 'client123', companyId: mockCompanyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'hash123' };
      const mockOcrResult = {
        text: 'processed text',
        confidence: 0.95,
        metadata: {
          provider: 'Test OCR',
          pages: 1,
          mimeType: 'application/pdf',
          structuredData: {},
          rawResponse: {},
        },
      };

      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockOcrService.processDocument.mockResolvedValue(mockOcrResult);
      mockPrismaService.document.create.mockResolvedValue({
        id: 'doc123',
        title: mockCreateDocumentDto.title,
        content: mockOcrResult.text,
      } as Document);

      // Act
      const result = await service.create(mockFile, mockCreateDocumentDto, mockCompanyId);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe(mockCreateDocumentDto.title);
      expect(result.content).toBe(mockOcrResult.text);
      expect(mockFileService.isValidFile).toHaveBeenCalledWith(mockFile);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: {
          companyId: mockCompanyId,
          clientReferenceId: mockCreateDocumentDto.clientId,
        },
      });
    });

    it('should throw BadRequestException for invalid file', async () => {
      // Arrange
      mockFileService.isValidFile.mockReturnValue(false);

      // Act & Assert
      await expect(
        service.create(mockFile, mockCreateDocumentDto, mockCompanyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when client is not found', async () => {
      // Arrange
      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(mockFile, mockCreateDocumentDto, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should handle empty result set', async () => {
      // Arrange
      const mockCompanyId = 'company123';
      mockPrismaService.document.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll(mockCompanyId);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle null companyId', async () => {
      // Arrange
      mockPrismaService.document.findMany.mockRejectedValue(new Error('Invalid company ID'));

      // Act & Assert
      await expect(service.findAll(null)).rejects.toThrow('Invalid company ID');
    });


    const mockCompanyId = 'company123';

    it('should return all documents for a company', async () => {
      // Arrange
      const mockDocuments = [
        { id: '1', title: 'Doc 1' },
        { id: '2', title: 'Doc 2' },
      ];
      mockPrismaService.document.findMany.mockResolvedValue(mockDocuments);

      // Act
      const result = await service.findAll(mockCompanyId);

      // Assert
      expect(result).toEqual(mockDocuments);
      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle errors when finding documents', async () => {
      // Arrange
      const mockError = new Error('Database error');
      mockPrismaService.document.findMany.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.findAll(mockCompanyId)).rejects.toThrow(mockError);
    });
  });

  describe('findOne', () => {
    const mockDocumentId = 'doc123';
    const mockCompanyId = 'company123';

    it('should return a document when found', async () => {
      // Arrange
      const mockDocument = {
        id: mockDocumentId,
        title: 'Test Document',
        content: 'Test Content',
        client: { id: 'client123', name: 'Test Client' },
      };
      mockPrismaService.document.findFirst.mockResolvedValue(mockDocument);

      // Act
      const result = await service.findOne(mockDocumentId, mockCompanyId);

      // Assert
      expect(result).toEqual(mockDocument);
      expect(mockPrismaService.document.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDocumentId,
          companyId: mockCompanyId,
        },
        include: {
          client: true,
        },
      });
    });

    it('should throw NotFoundException when document is not found', async () => {
      // Arrange
      mockPrismaService.document.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne(mockDocumentId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should handle metadata merging correctly', async () => {
      // Arrange
      const mockDocumentId = 'doc123';
      const mockCompanyId = 'company123';
      const existingMetadata = {
        documentType: 'OLD_TYPE',
        confidence: 0.8,
        customField: 'value'
      };
      const updateMetadata = {
        documentType: 'NEW_TYPE',
        newField: 'new value'
      };
      
      mockPrismaService.document.findFirst.mockResolvedValue({
        id: mockDocumentId,
        metadata: JSON.stringify(existingMetadata)
      });
      
      mockPrismaService.document.update.mockImplementation(args => {
        const newMetadata = JSON.parse(args.data.metadata);
        return Promise.resolve({
          ...args.data,
          metadata: JSON.stringify(newMetadata)
        });
      });

      // Act
      const result = await service.update(mockDocumentId, {
        metadata: updateMetadata
      }, mockCompanyId);

      // Assert
      const resultMetadata = JSON.parse(result.metadata);
      expect(resultMetadata).toMatchObject({
        ...existingMetadata,
        ...updateMetadata,
        lastUpdated: expect.any(String)
      });
    });

    it('should handle invalid metadata format', async () => {
      // Arrange
      const mockDocumentId = 'doc123';
      const mockCompanyId = 'company123';
      
      mockPrismaService.document.findFirst.mockResolvedValue({
        id: mockDocumentId,
        metadata: 'invalid-json'
      });

      mockPrismaService.document.update.mockRejectedValue(
        new Error('Invalid metadata format')
      );

      // Act & Assert
      await expect(
        service.update(mockDocumentId, {
          metadata: { newField: 'value' }
        }, mockCompanyId)
      ).rejects.toThrow('Invalid metadata format');
    });


    const mockDocumentId = 'doc123';
    const mockCompanyId = 'company123';

    it('should update a document successfully', async () => {
      // Arrange
      const mockUpdateDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        metadata: {
          documentType: 'UPDATED_TYPE',
        },
      };

      const mockExistingDocument = {
        id: mockDocumentId,
        title: 'Old Title',
        content: 'Old Content',
        metadata: JSON.stringify({
          documentType: 'OLD_TYPE',
          confidence: 0.9,
        }),
      };

      const mockUpdatedDocument = {
        ...mockExistingDocument,
        title: mockUpdateDto.title,
        content: mockUpdateDto.content,
        metadata: JSON.stringify({
          documentType: 'UPDATED_TYPE',
          confidence: 0.9,
          lastUpdated: expect.any(String),
        }),
      };

      mockPrismaService.document.findFirst.mockResolvedValue(mockExistingDocument);
      mockPrismaService.document.update.mockResolvedValue(mockUpdatedDocument);

      // Act
      const result = await service.update(mockDocumentId, mockUpdateDto, mockCompanyId);

      // Assert
      expect(result).toEqual(mockUpdatedDocument);
      expect(mockPrismaService.document.update).toHaveBeenCalledWith({
        where: {
          id: mockDocumentId,
          AND: { companyId: mockCompanyId },
        },
        data: expect.objectContaining({
          title: mockUpdateDto.title,
          content: mockUpdateDto.content,
        }),
      });
    });

    it('should throw NotFoundException when document to update is not found', async () => {
      // Arrange
      mockPrismaService.document.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(mockDocumentId, { title: 'New Title' }, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('processDocument', () => {
    it('should handle large file sizes', async () => {
      // Arrange
      const mockFile = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024 * 100, // 100MB
      } as Express.Multer.File;
      
      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue({ id: 'client123' });
      mockFileService.saveFile.mockResolvedValue({ filePath: '/path/to/file', hash: 'hash123' });
      mockOcrService.processDocument.mockResolvedValue({
        text: 'processed text',
        confidence: 0.95,
        metadata: {
          provider: 'Test OCR',
          pages: 1,
          mimeType: 'application/pdf',
          structuredData: {},
          rawResponse: {},
        },
      });

      const mockCreatedDoc = {
        id: 'doc123',
        title: mockFile.originalname,
        content: 'processed text',
        size: mockFile.size
      } as Document;

      mockPrismaService.document.create.mockResolvedValue(mockCreatedDoc);

      // Act
      const result = await service.processDocument(
        mockFile,
        'client123',
        'company123',
        'ID_CARD'
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.size).toBe(mockFile.size);
    });

    it('should handle unsupported file types', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.xyz',
        mimetype: 'application/xyz',
        size: 1024,
      } as Express.Multer.File;
      
      mockFileService.isValidFile.mockReturnValue(false);

      // Act & Assert
      await expect(
        service.processDocument(mockFile, 'client123', 'company123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle empty file content', async () => {
      // Arrange
      const mockFile = {
        originalname: 'empty.pdf',
        mimetype: 'application/pdf',
        size: 0,
      } as Express.Multer.File;
      
      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue({ id: 'client123' });
      mockFileService.saveFile.mockResolvedValue({ filePath: '/path/to/file', hash: 'hash123' });
      mockOcrService.processDocument.mockResolvedValue({
        text: '',
        confidence: 0,
        metadata: {
          provider: 'Test OCR',
          pages: 0,
          mimeType: 'application/pdf',
          structuredData: {},
          rawResponse: {},
        },
      });

      const mockCreatedDoc = {
        id: 'doc123',
        title: mockFile.originalname,
        content: '',
        metadata: JSON.stringify({
          confidence: 0,
          provider: 'Test OCR',
          pages: 0,
          mimeType: 'application/pdf',
        })
      } as Document;

      mockPrismaService.document.create.mockResolvedValue(mockCreatedDoc);

      // Act
      const result = await service.processDocument(
        mockFile,
        'client123',
        'company123'
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe('');
      expect(JSON.parse(result.metadata).confidence).toBe(0);
    });


    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    const mockClientId = 'client123';
    const mockCompanyId = 'company123';
    const mockDocumentType = 'ID_CARD';

    it('should process a document successfully', async () => {
      // Arrange
      const mockClient = { id: 'client123', companyId: mockCompanyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'hash123' };
      const mockOcrResult = {
        text: 'processed text',
        confidence: 0.95,
        metadata: {
          provider: 'Test OCR',
          pages: 1,
          mimeType: 'application/pdf',
          structuredData: { fields: { name: 'John Doe' } },
          rawResponse: {},
        },
      };

      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockOcrService.processDocument.mockResolvedValue(mockOcrResult);
      mockPrismaService.document.create.mockResolvedValue({
        id: 'doc123',
        title: mockFile.originalname,
        content: mockOcrResult.text,
      } as Document);

      // Act
      const result = await service.processDocument(
        mockFile,
        mockClientId,
        mockCompanyId,
        mockDocumentType,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe(mockOcrResult.text);
      expect(mockOcrService.processDocument).toHaveBeenCalledWith(
        mockSavedFile.filePath,
        mockDocumentType,
      );
    });

    it('should handle OCR processing errors gracefully', async () => {
      // Arrange
      const mockClient = { id: 'client123', companyId: mockCompanyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'hash123' };
      
      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockOcrService.processDocument.mockRejectedValue(new Error('OCR processing failed'));

      // Act & Assert
      await expect(
        service.processDocument(mockFile, mockClientId, mockCompanyId),
      ).rejects.toThrow('OCR processing failed');
    });

    it('should use default document type when none is provided', async () => {
      // Arrange
      const mockClient = { id: 'client123', companyId: mockCompanyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'hash123' };
      const mockOcrResult = {
        text: 'processed text',
        confidence: 0.95,
        metadata: {
          provider: 'Test OCR',
          pages: 1,
          mimeType: 'application/pdf',
          structuredData: {},
          rawResponse: {},
        },
      };

      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockOcrService.processDocument.mockResolvedValue(mockOcrResult);
      mockPrismaService.document.create.mockResolvedValue({
        id: 'doc123',
        metadata: JSON.stringify({ documentType: 'ID_CARD' }),
      } as Document);

      // Act
      const result = await service.processDocument(mockFile, mockClientId, mockCompanyId);

      // Assert
      expect(JSON.parse(result.metadata).documentType).toBe('ID_CARD');
    });
  });

  describe('processDocument', () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    const mockClientId = 'client123';
    const mockCompanyId = 'company123';
    const mockDocumentType = 'ID_CARD';

    it('should process a document successfully with a specified document type', async () => {
      // Arrange
      const mockClient = { id: mockClientId, companyId: mockCompanyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'hash123' };
      const mockOcrResult = {
        text: 'processed text',
        confidence: 0.95,
        metadata: {
          provider: 'Test OCR',
          pages: 1,
          mimeType: 'application/pdf',
          structuredData: { idNumber: '123456789' },
          rawResponse: { raw: 'data' },
        },
      };

      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockOcrService.processDocument.mockResolvedValue(mockOcrResult);
      mockPrismaService.document.create.mockResolvedValue({
        id: 'doc123',
        title: mockFile.originalname,
        content: mockOcrResult.text,
        metadata: JSON.stringify({
          documentType: mockDocumentType,
          confidence: mockOcrResult.confidence,
          structuredData: mockOcrResult.metadata.structuredData,
        }),
      } as Document);

      // Act
      const result = await service.processDocument(
        mockFile,
        mockClientId,
        mockCompanyId,
        mockDocumentType
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe(mockFile.originalname);
      expect(result.content).toBe(mockOcrResult.text);
      const metadata = JSON.parse(result.metadata);
      expect(metadata.documentType).toBe(mockDocumentType);
      expect(metadata.confidence).toBe(mockOcrResult.confidence);
      expect(metadata.structuredData).toEqual(mockOcrResult.metadata.structuredData);

      expect(mockFileService.isValidFile).toHaveBeenCalledWith(mockFile);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: {
          companyId: mockCompanyId,
          clientReferenceId: mockClientId,
        },
      });
      expect(mockOcrService.processDocument).toHaveBeenCalledWith(
        mockSavedFile.filePath,
        mockDocumentType
      );
    });

    it('should throw BadRequestException for invalid file', async () => {
      // Arrange
      mockFileService.isValidFile.mockReturnValue(false);

      // Act & Assert
      await expect(
        service.processDocument(mockFile, mockClientId, mockCompanyId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when client is not found', async () => {
      // Arrange
      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.processDocument(mockFile, mockClientId, mockCompanyId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle OCR service errors gracefully', async () => {
      // Arrange
      const mockClient = { id: mockClientId, companyId: mockCompanyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'hash123' };
      const mockError = new Error('OCR processing failed');

      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockOcrService.processDocument.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        service.processDocument(mockFile, mockClientId, mockCompanyId)
      ).rejects.toThrow(mockError);
    });
  });

  describe('remove', () => {
    it('should handle file deletion errors gracefully', async () => {
      // Arrange
      const mockDocumentId = 'doc123';
      const mockCompanyId = 'company123';
      const mockDocument = {
        id: mockDocumentId,
        filePath: '/path/to/file',
        title: 'Test Doc'
      };

      mockPrismaService.document.findFirst.mockResolvedValue(mockDocument);
      mockFileService.deleteFile.mockRejectedValue(new Error('File system error'));
      mockPrismaService.document.delete.mockResolvedValue({
        ...mockDocument,
        client: { clientReferenceId: 'client123', name: 'Test Client' }
      });

      // Act
      const result = await service.remove(mockDocumentId, mockCompanyId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deletedDocument.id).toBe(mockDocumentId);
      expect(mockFileService.deleteFile).toHaveBeenCalled();
    });

    it('should handle missing filePath gracefully', async () => {
      // Arrange
      const mockDocumentId = 'doc123';
      const mockCompanyId = 'company123';
      const mockDocument = {
        id: mockDocumentId,
        title: 'Test Doc'
      };

      mockPrismaService.document.findFirst.mockResolvedValue(mockDocument);
      mockPrismaService.document.delete.mockResolvedValue({
        ...mockDocument,
        client: { clientReferenceId: 'client123', name: 'Test Client' }
      });

      // Act
      const result = await service.remove(mockDocumentId, mockCompanyId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deletedDocument.id).toBe(mockDocumentId);
      expect(mockFileService.deleteFile).not.toHaveBeenCalled();
    });

    it('should handle database deletion errors', async () => {
      // Arrange
      const mockDocumentId = 'doc123';
      const mockCompanyId = 'company123';
      const mockDocument = {
        id: mockDocumentId,
        filePath: '/path/to/file',
        title: 'Test Doc'
      };

      mockPrismaService.document.findFirst.mockResolvedValue(mockDocument);
      mockPrismaService.document.delete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.remove(mockDocumentId, mockCompanyId)
      ).rejects.toThrow('Database error');
    });


    const mockDocumentId = 'doc123';
    const mockCompanyId = 'company123';

    it('should delete a document successfully', async () => {
      // Arrange
      const mockDocument = {
        id: mockDocumentId,
        filePath: '/path/to/file',
        title: 'Test Doc',
      };
      mockPrismaService.document.findFirst.mockResolvedValue(mockDocument);
      mockPrismaService.document.delete.mockResolvedValue({
        ...mockDocument,
        client: { clientReferenceId: 'client123', name: 'Test Client' },
      });

      // Act
      const result = await service.remove(mockDocumentId, mockCompanyId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deletedDocument.id).toBe(mockDocumentId);
      expect(mockFileService.deleteFile).toHaveBeenCalledWith(mockDocument.filePath);
      expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
        where: {
          id: mockDocumentId,
          AND: { companyId: mockCompanyId },
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
    });
  });
});
