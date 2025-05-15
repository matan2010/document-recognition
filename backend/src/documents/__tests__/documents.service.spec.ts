import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../documents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from '../services/file.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OCR_SERVICE } from '../constants';
import { JsonField } from '../../common/utils/json-field.util';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaService: PrismaService;
  let fileService: FileService;
  let ocrService: any;

  const mockPrismaService = {
    client: {
      findFirst: jest.fn(),
    },
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockFileService = {
    isValidFile: jest.fn(),
    saveFile: jest.fn(),
  };

  const mockOcrService = {
    processDocument: jest.fn(),
  };

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
    ocrService = module.get(OCR_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockFile: Express.Multer.File = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      fieldname: 'file',
      encoding: '7bit',
      destination: '/tmp',
      filename: 'test.pdf',
      path: '/tmp/test.pdf',
      stream: null,
    };

    const createDocumentDto = {
      title: 'Test Document',
      clientId: 'CLIENT001',
    };

    const companyId = 'company123';

    it('should create a document successfully', async () => {
      const mockClient = { id: 'client123', companyId };
      const mockSavedFile = { filePath: '/path/to/file', hash: 'file-hash' };
      const mockOcrResult = {
        text: 'Processed text',
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
      mockFileService.saveFile.mockResolvedValue(mockSavedFile);
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockOcrService.processDocument.mockResolvedValue(mockOcrResult);

      const expectedDocument = {
        id: 'doc123',
        title: createDocumentDto.title,
        content: mockOcrResult.text,
        fileName: mockFile.originalname,
        fileType: mockFile.mimetype,
        filePath: mockSavedFile.filePath,
        fileHash: mockSavedFile.hash,
        size: mockFile.size,
        clientId: mockClient.id,
        companyId,
      };

      mockPrismaService.document.create.mockResolvedValue(expectedDocument);

      const result = await service.create(
        mockFile,
        createDocumentDto,
        companyId,
      );

      expect(result).toEqual(expectedDocument);
      expect(mockFileService.isValidFile).toHaveBeenCalledWith(mockFile);
      expect(mockFileService.saveFile).toHaveBeenCalledWith(
        mockFile,
        companyId,
      );
      expect(mockOcrService.processDocument).toHaveBeenCalledWith(
        mockSavedFile.filePath,
        'id',
      );
    });

    it('should throw BadRequestException for invalid file', async () => {
      mockFileService.isValidFile.mockReturnValue(false);

      await expect(
        service.create(mockFile, createDocumentDto, companyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when client not found', async () => {
      mockFileService.isValidFile.mockReturnValue(true);
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      await expect(
        service.create(mockFile, createDocumentDto, companyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const companyId = 'company123';

    it('should return all documents for a company', async () => {
      const mockDocuments = [
        { id: 'doc1', title: 'Document 1', companyId },
        { id: 'doc2', title: 'Document 2', companyId },
      ];

      mockPrismaService.document.findMany.mockResolvedValue(mockDocuments);

      const result = await service.findAll(companyId);

      expect(result).toEqual(mockDocuments);
      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    const documentId = 'doc123';
    const companyId = 'company123';

    it('should return a specific document', async () => {
      const mockDocument = {
        id: documentId,
        title: 'Test Document',
        companyId,
      };

      mockPrismaService.document.findFirst.mockResolvedValue(mockDocument);

      const result = await service.findOne(documentId, companyId);

      expect(result).toEqual(mockDocument);
      expect(mockPrismaService.document.findFirst).toHaveBeenCalledWith({
        where: { id: documentId, companyId },
        include: { client: true },
      });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrismaService.document.findFirst.mockResolvedValue(null);

      await expect(service.findOne(documentId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByClientId', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should return all documents for a client', async () => {
      const mockDocuments = [
        { id: 'doc1', clientId, companyId },
        { id: 'doc2', clientId, companyId },
      ];

      mockPrismaService.document.findMany.mockResolvedValue(mockDocuments);

      const result = await service.findByClientId(clientId, companyId);

      expect(result).toEqual(mockDocuments);
      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { clientId, companyId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    const documentId = 'doc123';
    const companyId = 'company123';
    const updateDocumentDto = {
      title: 'Updated Title',
      content: 'Updated Content',
      metadata: { key: 'value' },
    };

    it('should update a document successfully', async () => {
      const existingDocument = {
        id: documentId,
        companyId,
        metadata: JsonField.serialize({ existingKey: 'existingValue' }),
      };

      const updatedDocument = {
        ...existingDocument,
        title: updateDocumentDto.title,
        content: updateDocumentDto.content,
        metadata: JsonField.serialize({
          existingKey: 'existingValue',
          key: 'value',
          lastUpdated: expect.any(String),
        }),
      };

      mockPrismaService.document.findFirst.mockResolvedValue(existingDocument);
      mockPrismaService.document.update.mockResolvedValue(updatedDocument);

      const result = await service.update(
        documentId,
        updateDocumentDto,
        companyId,
      );

      expect(result).toEqual(updatedDocument);
      expect(mockPrismaService.document.update).toHaveBeenCalledWith({
        where: {
          id: documentId,
          AND: { companyId },
        },
        data: expect.objectContaining({
          title: updateDocumentDto.title,
          content: updateDocumentDto.content,
        }),
      });
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPrismaService.document.findFirst.mockResolvedValue(null);

      await expect(
        service.update(documentId, updateDocumentDto, companyId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
