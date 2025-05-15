import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';

describe('ClientsService', () => {
  let service: ClientsService;
  let mockPrismaService: jest.Mocked<PrismaService> & { client: any };

  const mockCompanyId = 'company123';
  const mockClientId = 'client123';
  const mockClient = {
    id: mockClientId,
    clientReferenceId: 'REF123',
    name: 'Test Client',
    email: 'client@test.com',
    companyId: mockCompanyId,
    createdAt: new Date(),
    updatedAt: new Date(),
    documents: [],
  };

  beforeEach(async () => {
    mockPrismaService = {
      $transaction: jest.fn(),
      client: {
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
        findMany: jest.fn().mockImplementation(() => Promise.resolve([])),
        create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
        update: jest.fn().mockImplementation((data) => Promise.resolve(data)),
        delete: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createClientDto: CreateClientDto = {
      clientReferenceId: 'REF123',
      name: 'Test Client',
      email: 'client@test.com',
    };

    it('should create a client successfully', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      mockPrismaService.client.create.mockResolvedValue(mockClient);

      // Act
      const result = await service.create(createClientDto, mockCompanyId);

      // Assert
      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: {
          clientReferenceId: createClientDto.clientReferenceId,
          name: createClientDto.name,
          email: createClientDto.email,
          company: {
            connect: {
              id: mockCompanyId,
            },
          },
        },
      });
    });

    it('should throw ConflictException if client reference ID already exists', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(
        service.create(createClientDto, mockCompanyId),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle Prisma unique constraint violation', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      mockPrismaService.client.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '1.0',
        }),
      );

      // Act & Assert
      await expect(
        service.create(createClientDto, mockCompanyId),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate unknown errors', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      mockPrismaService.client.create.mockRejectedValue(new Error('Unknown error'));

      // Act & Assert
      await expect(
        service.create(createClientDto, mockCompanyId),
      ).rejects.toThrow('Unknown error');
    });
  });

  describe('findAll', () => {
    it('should return all clients for a company', async () => {
      // Arrange
      const mockClients = [mockClient];
      mockPrismaService.client.findMany.mockResolvedValue(mockClients);

      // Act
      const result = await service.findAll(mockCompanyId);

      // Assert
      expect(result).toEqual(mockClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        include: { documents: true },
      });
    });

    it('should return empty array when no clients exist', async () => {
      // Arrange
      mockPrismaService.client.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll(mockCompanyId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockPrismaService.client.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findAll(mockCompanyId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a client if found', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);

      // Act
      const result = await service.findOne(mockClientId, mockCompanyId);

      // Assert
      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: { id: mockClientId, companyId: mockCompanyId },
        include: { documents: true },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne(mockClientId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        service.findOne(mockClientId, mockCompanyId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    const updateClientDto: UpdateClientDto = {
      name: 'Updated Client',
      email: 'updated@test.com',
    };

    it('should update a client successfully', async () => {
      // Arrange
      const updatedClient = { ...mockClient, ...updateClientDto };
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      // Act
      const result = await service.update(
        mockClientId,
        updateClientDto,
        mockCompanyId,
      );

      // Assert
      expect(result).toEqual(updatedClient);
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: mockClientId },
        data: updateClientDto,
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(mockClientId, updateClientDto, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated reference ID already exists', async () => {
      // Arrange
      const dtoWithRefId = { ...updateClientDto, clientReferenceId: 'REF456' };
      mockPrismaService.client.findFirst
        .mockResolvedValueOnce(mockClient) // First call for existence check
        .mockResolvedValueOnce({ ...mockClient, id: 'other123' }); // Second call for duplicate check

      // Act & Assert
      await expect(
        service.update(mockClientId, dtoWithRefId, mockCompanyId),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle Prisma unique constraint violation', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockPrismaService.client.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '1.0',
        }),
      );

      // Act & Assert
      await expect(
        service.update(mockClientId, updateClientDto, mockCompanyId),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate unknown errors', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockPrismaService.client.update.mockRejectedValue(
        new Error('Unknown error'),
      );

      // Act & Assert
      await expect(
        service.update(mockClientId, updateClientDto, mockCompanyId),
      ).rejects.toThrow('Unknown error');
    });
  });

  describe('findClientDocuments', () => {
    it('should return client documents if client exists', async () => {
      // Arrange
      const mockDocuments = [
        { id: 'doc1', name: 'Document 1' },
        { id: 'doc2', name: 'Document 2' },
      ];
      mockPrismaService.client.findFirst.mockResolvedValue({
        ...mockClient,
        documents: mockDocuments,
      });

      // Act
      const result = await service.findClientDocuments(
        mockClientId,
        mockCompanyId,
      );

      // Assert
      expect(result).toEqual(mockDocuments);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: { id: mockClientId, companyId: mockCompanyId },
        include: { documents: true },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findClientDocuments(mockClientId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array if client has no documents', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue({
        ...mockClient,
        documents: [],
      });

      // Act
      const result = await service.findClientDocuments(
        mockClientId,
        mockCompanyId,
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should delete a client successfully', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockPrismaService.client.delete.mockResolvedValue(mockClient);

      // Act
      const result = await service.remove(mockClientId, mockCompanyId);

      // Assert
      expect(result).toEqual(mockClient);
      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({
        where: { id: mockClientId },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove(mockClientId, mockCompanyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      mockPrismaService.client.findFirst.mockResolvedValue(mockClient);
      mockPrismaService.client.delete.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        service.remove(mockClientId, mockCompanyId),
      ).rejects.toThrow('Database error');
    });
  });
});
