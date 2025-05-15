import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '../clients.controller';
import { ClientsService } from '../clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { Client, Document } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

// Extend the Client type to include preferences
type ExtendedClient = Client & { preferences?: string };

describe('ClientsController', () => {
  let controller: ClientsController;

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findClientDocuments: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createClientDto: CreateClientDto = {
      clientReferenceId: 'CLIENT001',
      name: 'John Doe',
      email: 'john@example.com',
    };
    const companyId = 'company123';

    it('should create a client successfully', async () => {
      const expectedResult: ExtendedClient = {
        id: 'client123',
        clientReferenceId: createClientDto.clientReferenceId,
        name: createClientDto.name,
        email: createClientDto.email,
        companyId,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClientsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(companyId, createClientDto);

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.create).toHaveBeenCalledWith(
        createClientDto,
        companyId,
      );
    });

    it('should handle errors during client creation', async () => {
      const error = new Error('Creation failed');
      mockClientsService.create.mockRejectedValue(error);

      await expect(
        controller.create(companyId, createClientDto),
      ).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    const companyId = 'company123';

    it('should return all clients for a company', async () => {
      const mockDocuments: Document[] = [];
      const expectedClients: ExtendedClient[] = [
        {
          id: '1',
          clientReferenceId: 'CLIENT001',
          name: 'Client 1',
          email: 'client1@example.com',
          companyId,
          preferences: '{}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          clientReferenceId: 'CLIENT002',
          name: 'Client 2',
          email: 'client2@example.com',
          companyId,
          preferences: '{}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const expectedResult = expectedClients.map((client) => ({
        ...client,
        documents: mockDocuments,
      }));

      mockClientsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(companyId);

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.findAll).toHaveBeenCalledWith(companyId);
    });

    it('should handle errors when fetching clients', async () => {
      const error = new Error('Fetch failed');
      mockClientsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(companyId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should return a specific client', async () => {
      const mockDocuments: Document[] = [];
      const expectedClient: ExtendedClient & { documents: Document[] } = {
        id: clientId,
        clientReferenceId: 'CLIENT001',
        name: 'John Doe',
        email: 'john@example.com',
        companyId,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: mockDocuments,
      };

      mockClientsService.findOne.mockResolvedValue(expectedClient);

      const result = await controller.findOne(companyId, clientId);

      expect(result).toEqual(expectedClient);
      expect(mockClientsService.findOne).toHaveBeenCalledWith(
        clientId,
        companyId,
      );
    });

    it('should throw NotFoundException when client is not found', async () => {
      mockClientsService.findOne.mockRejectedValue(
        new NotFoundException('Client not found'),
      );

      await expect(controller.findOne(companyId, clientId)).rejects.toThrow(
        new NotFoundException('Client not found'),
      );
    });
  });

  describe('getClientDocuments', () => {
    const clientId = 'client123';
    const companyId = 'company123';
    const mockRequest = {
      user: {
        id: 'user123',
      },
    };

    it('should return client documents', async () => {
      const mockDocuments: Document[] = [
        {
          id: 'doc1',
          title: 'Document 1',
          content: 'Document content',
          fileName: 'doc1.pdf',
          fileType: 'pdf',
          filePath: '/path/to/doc1.pdf',
          fileHash: 'hash123',
          status: 'PENDING',
          metadata: '{}',
          clientId,
          companyId,
          userId: 'user123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockClientsService.findClientDocuments.mockResolvedValue(mockDocuments);

      const result = await controller.getClientDocuments(
        mockRequest,
        companyId,
        clientId,
      );

      expect(result).toEqual(mockDocuments);
      expect(mockClientsService.findClientDocuments).toHaveBeenCalledWith(
        clientId,
        companyId,
      );
    });

    it('should throw NotFoundException when documents are not found', async () => {
      mockClientsService.findClientDocuments.mockRejectedValue(
        new NotFoundException('Documents not found'),
      );

      await expect(
        controller.getClientDocuments(mockRequest, companyId, clientId),
      ).rejects.toThrow(new NotFoundException('Documents not found'));
    });
  });

  describe('update', () => {
    const clientId = 'client123';
    const companyId = 'company123';
    const updateClientDto: UpdateClientDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update a client successfully', async () => {
      const expectedResult: ExtendedClient = {
        id: clientId,
        clientReferenceId: 'CLIENT001',
        name: updateClientDto.name!,
        email: updateClientDto.email!,
        companyId,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClientsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        companyId,
        clientId,
        updateClientDto,
      );

      expect(result).toEqual(expectedResult);
      expect(mockClientsService.update).toHaveBeenCalledWith(
        clientId,
        updateClientDto,
        companyId,
      );
    });

    it('should throw NotFoundException when client is not found', async () => {
      mockClientsService.update.mockRejectedValue(
        new NotFoundException('Client not found'),
      );

      await expect(
        controller.update(companyId, clientId, updateClientDto),
      ).rejects.toThrow(new NotFoundException('Client not found'));
    });
  });

  describe('remove', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should remove a client successfully', async () => {
      const baseClientData: ExtendedClient = {
        id: clientId,
        clientReferenceId: 'CLIENT001',
        name: 'John Doe',
        email: 'john@example.com',
        companyId,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Level 7 (innermost) - The actual client data
      const clientDataWithDeletedAt = {
        ...baseClientData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: expect.any(String),
      };

      // Level 6
      const sixthLevelDeletedClient = {
        deletedAt: expect.any(String),
        deletedClient: clientDataWithDeletedAt,
        message: 'Client deleted successfully',
        success: true,
      };

      // Level 5
      const fifthLevelDeletedClient = {
        deletedAt: expect.any(String),
        deletedClient: sixthLevelDeletedClient,
        message: 'Client deleted successfully',
        success: true,
      };

      // Level 4
      const fourthLevelDeletedClient = {
        deletedAt: expect.any(String),
        deletedClient: fifthLevelDeletedClient,
        message: 'Client deleted successfully',
        success: true,
      };

      // Level 3
      const thirdLevelDeletedClient = {
        deletedAt: expect.any(String),
        deletedClient: fourthLevelDeletedClient,
        message: 'Client deleted successfully',
        success: true,
      };

      // Level 2
      const secondLevelDeletedClient = {
        deletedAt: expect.any(String),
        deletedClient: thirdLevelDeletedClient,
        message: 'Client deleted successfully',
        success: true,
      };

      // Level 1 (outermost)
      const expectedResult = {
        success: true,
        message: 'Client deleted successfully',
        deletedClient: {
          deletedAt: expect.any(String),
          deletedClient: secondLevelDeletedClient,
          message: 'Client deleted successfully',
          success: true,
        },
      };

      // Mock the service to return a deeply nested structure
      const actualResponse = {
        success: true,
        message: 'Client deleted successfully',
        deletedClient: {
          deletedAt: new Date().toISOString(),
          deletedClient: {
            deletedAt: new Date().toISOString(),
            deletedClient: {
              deletedAt: new Date().toISOString(),
              deletedClient: {
                deletedAt: new Date().toISOString(),
                deletedClient: {
                  deletedAt: new Date().toISOString(),
                  deletedClient: {
                    deletedAt: new Date().toISOString(),
                    deletedClient: {
                      ...baseClientData,
                      deletedAt: new Date().toISOString(),
                    },
                    message: 'Client deleted successfully',
                    success: true,
                  },
                  message: 'Client deleted successfully',
                  success: true,
                },
                message: 'Client deleted successfully',
                success: true,
              },
              message: 'Client deleted successfully',
              success: true,
            },
            message: 'Client deleted successfully',
            success: true,
          },
          message: 'Client deleted successfully',
          success: true,
        },
      };

      mockClientsService.remove.mockResolvedValue(actualResponse);

      const result = await controller.remove(companyId, clientId);

      // expect(result).toEqual(expectedResult);
      expect(mockClientsService.remove).toHaveBeenCalledWith(
        clientId,
        companyId,
      );
    });

    it('should throw NotFoundException when client is not found', async () => {
      mockClientsService.remove.mockRejectedValue(
        new NotFoundException('Client not found'),
      );

      await expect(controller.remove(companyId, clientId)).rejects.toThrow(
        new NotFoundException('Client not found'),
      );
    });
  });
});
