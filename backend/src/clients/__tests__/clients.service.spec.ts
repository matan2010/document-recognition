import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from '../clients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    client: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createClientDto = {
      clientReferenceId: 'CLIENT001',
      name: 'John Doe',
      email: 'john@example.com',
    };
    const companyId = 'company123';

    it('should create a client successfully', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      const expectedResult = { id: 'client123', ...createClientDto, companyId };
      mockPrismaService.client.create.mockResolvedValue(expectedResult);

      const result = await service.create(createClientDto, companyId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: {
          companyId,
          clientReferenceId: createClientDto.clientReferenceId,
        },
      });
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: {
          clientReferenceId: createClientDto.clientReferenceId,
          name: createClientDto.name,
          email: createClientDto.email,
          company: {
            connect: {
              id: companyId,
            },
          },
        },
      });
    });

    it('should throw ConflictException if client reference ID already exists', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue({ id: 'existing123' });

      await expect(service.create(createClientDto, companyId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle Prisma unique constraint violation', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);
      mockPrismaService.client.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '2.0.0',
        }),
      );

      await expect(service.create(createClientDto, companyId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    const companyId = 'company123';

    it('should return all clients for a company', async () => {
      const expectedClients = [
        { id: '1', name: 'Client 1', companyId },
        { id: '2', name: 'Client 2', companyId },
      ];
      mockPrismaService.client.findMany.mockResolvedValue(expectedClients);

      const result = await service.findAll(companyId);

      expect(result).toEqual(expectedClients);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { companyId },
        include: { documents: true },
      });
    });
  });

  describe('findOne', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should return a specific client', async () => {
      const expectedClient = {
        id: clientId,
        name: 'John Doe',
        companyId,
        documents: [],
      };
      mockPrismaService.client.findFirst.mockResolvedValue(expectedClient);

      const result = await service.findOne(clientId, companyId);

      expect(result).toEqual(expectedClient);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: { id: clientId, companyId },
        include: { documents: true },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      await expect(service.findOne(clientId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const clientId = 'client123';
    const companyId = 'company123';
    const updateClientDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update a client successfully', async () => {
      const existingClient = {
        id: clientId,
        companyId,
        name: 'Old Name',
        email: 'old@example.com',
      };
      mockPrismaService.client.findFirst.mockResolvedValue(existingClient);
      const updatedClient = { ...existingClient, ...updateClientDto };
      mockPrismaService.client.update.mockResolvedValue(updatedClient);

      const result = await service.update(clientId, updateClientDto, companyId);

      expect(result).toEqual(updatedClient);
      expect(mockPrismaService.client.update).toHaveBeenCalledWith({
        where: { id: clientId },
        data: updateClientDto,
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      await expect(
        service.update(clientId, updateClientDto, companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated reference ID already exists', async () => {
      const existingClient = {
        id: clientId,
        companyId,
        name: 'Old Name',
        email: 'old@example.com',
      };
      mockPrismaService.client.findFirst
        .mockResolvedValueOnce(existingClient) // First call for finding the client
        .mockResolvedValueOnce({ id: 'other123' }); // Second call for duplicate check

      const updateWithRefId = {
        ...updateClientDto,
        clientReferenceId: 'EXISTING001',
      };

      await expect(
        service.update(clientId, updateWithRefId, companyId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findClientDocuments', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should return client documents', async () => {
      const expectedDocuments = [
        { id: 'doc1', name: 'Document 1' },
        { id: 'doc2', name: 'Document 2' },
      ];
      mockPrismaService.client.findFirst.mockResolvedValue({
        id: clientId,
        documents: expectedDocuments,
      });

      const result = await service.findClientDocuments(clientId, companyId);

      expect(result).toEqual(expectedDocuments);
      expect(mockPrismaService.client.findFirst).toHaveBeenCalledWith({
        where: { id: clientId, companyId },
        include: { documents: true },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      await expect(
        service.findClientDocuments(clientId, companyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should remove a client successfully', async () => {
      const existingClient = {
        id: clientId,
        companyId,
        name: 'John Doe',
      };
      mockPrismaService.client.findFirst.mockResolvedValue(existingClient);
      mockPrismaService.client.delete.mockResolvedValue(existingClient);

      const result = await service.remove(clientId, companyId);

      expect(result).toEqual(existingClient);
      expect(mockPrismaService.client.delete).toHaveBeenCalledWith({
        where: { id: clientId },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.client.findFirst.mockResolvedValue(null);

      await expect(service.remove(clientId, companyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 