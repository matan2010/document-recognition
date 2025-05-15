import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '../../clients/clients.controller';
import { ClientsService } from '../../clients/clients.service';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { UpdateClientDto } from '../../clients/dto/update-client.dto';
import { Client, Document } from '@prisma/client';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

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
    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
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
      const expectedResult = {
        id: 'client123',
        ...createClientDto,
        companyId,
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
      const expectedClients = [
        { id: '1', name: 'Client 1', companyId },
        { id: '2', name: 'Client 2', companyId },
      ];

      mockClientsService.findAll.mockResolvedValue(expectedClients);

      const result = await controller.findAll(companyId);

      expect(result).toEqual(expectedClients);
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
      const expectedClient = {
        id: clientId,
        name: 'John Doe',
        companyId,
      };

      mockClientsService.findOne.mockResolvedValue(expectedClient);

      const result = await controller.findOne(companyId, clientId);

      expect(result).toEqual(expectedClient);
      expect(mockClientsService.findOne).toHaveBeenCalledWith(
        clientId,
        companyId,
      );
    });

    it('should handle errors when fetching a specific client', async () => {
      const error = new Error('Client not found');
      mockClientsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(companyId, clientId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getClientDocuments', () => {
    const clientId = 'client123';
    const companyId = 'company123';
    const req = { user: { id: 'user123' } };

    it('should return client documents', async () => {
      const expectedDocuments = [
        { id: 'doc1', clientId, name: 'Document 1' },
        { id: 'doc2', clientId, name: 'Document 2' },
      ];

      mockClientsService.findClientDocuments.mockResolvedValue(
        expectedDocuments,
      );

      const result = await controller.getClientDocuments(
        req,
        companyId,
        clientId,
      );

      expect(result).toEqual(expectedDocuments);
      expect(mockClientsService.findClientDocuments).toHaveBeenCalledWith(
        clientId,
        companyId,
      );
    });

    it('should handle errors when fetching client documents', async () => {
      const error = new Error('Documents not found');
      mockClientsService.findClientDocuments.mockRejectedValue(error);

      await expect(
        controller.getClientDocuments(req, companyId, clientId),
      ).rejects.toThrow(error);
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
      const expectedResult = {
        id: clientId,
        ...updateClientDto,
        companyId,
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

    it('should handle errors during client update', async () => {
      const error = new Error('Update failed');
      mockClientsService.update.mockRejectedValue(error);

      await expect(
        controller.update(companyId, clientId, updateClientDto),
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should remove a client successfully', async () => {
      const deletedClient = {
        id: clientId,
        name: 'Test Client',
        email: 'test@example.com',
        companyId: companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockClientsService.remove.mockResolvedValue(deletedClient);

      const result = await controller.remove(companyId, clientId);

      expect(result).toEqual({
        success: true,
        message: 'Client deleted successfully',
        deletedClient: {
          ...deletedClient,
          deletedAt: expect.any(String)
        }
      });
      expect(mockClientsService.remove).toHaveBeenCalledWith(clientId, companyId);
    });

    it('should handle errors during client removal', async () => {
      const error = new Error('Removal failed');
      mockClientsService.remove.mockRejectedValue(error);

      await expect(controller.remove(companyId, clientId)).rejects.toThrow(error);
    });
  });
});
