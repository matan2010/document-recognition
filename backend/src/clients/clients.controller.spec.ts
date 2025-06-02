import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, Document } from '@prisma/client';

// Extend the Client type to include preferences
type ExtendedClient = Client & { preferences?: string };

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

  // FR 2.1 - Client Creation
  // NFR 4.1.3 - Multi-tenancy Data Isolation
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

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(companyId, createClientDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createClientDto, companyId);
    });

    it('should handle errors during client creation', async () => {
      const error = new Error('Creation failed');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(
        controller.create(companyId, createClientDto),
      ).rejects.toThrow(error);
    });
  });

  // FR 2.2 - Client Data Management
  // NFR 4.1.3 - Multi-tenancy Data Isolation
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

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll(companyId);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(companyId);
    });

    it('should handle errors when fetching clients', async () => {
      const error = new Error('Fetch failed');
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      await expect(controller.findAll(companyId)).rejects.toThrow(error);
    });
  });

  // FR 2.2 - Client Data Management
  // FR 2.3 - Client Document Association
  // NFR 4.1.3 - Multi-tenancy Data Isolation
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

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedClient);

      const result = await controller.findOne(companyId, clientId);

      expect(result).toEqual(expectedClient);
      expect(service.findOne).toHaveBeenCalledWith(clientId, companyId);
    });

    it('should handle errors when fetching a specific client', async () => {
      const error = new Error('Client not found');
      jest.spyOn(service, 'findOne').mockRejectedValue(error);

      await expect(controller.findOne(companyId, clientId)).rejects.toThrow(
        error,
      );
    });
  });

  // FR 2.2 - Client Data Management
  // FR 2.4 - Client Preferences
  // NFR 4.1.3 - Multi-tenancy Data Isolation
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

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.update(
        companyId,
        clientId,
        updateClientDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(
        clientId,
        updateClientDto,
        companyId,
      );
    });

    it('should handle errors during client update', async () => {
      const error = new Error('Update failed');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(
        controller.update(companyId, clientId, updateClientDto),
      ).rejects.toThrow(error);
    });
  });

  // FR 2.2 - Client Data Management
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // NFR 4.1.4 - Data Retention Policy
  describe('remove', () => {
    const clientId = 'client123';
    const companyId = 'company123';

    it('should remove a client successfully', async () => {
      const deletedClient: ExtendedClient = {
        id: clientId,
        clientReferenceId: 'CLIENT001',
        name: 'Test Client',
        email: 'test@example.com',
        companyId: companyId,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'remove').mockResolvedValue(deletedClient);

      const result = await controller.remove(companyId, clientId);

      expect(result).toEqual({
        success: true,
        message: 'Client deleted successfully',
        deletedClient: {
          ...deletedClient,
          deletedAt: expect.any(String),
        },
      });
      expect(service.remove).toHaveBeenCalledWith(clientId, companyId);
    });

    it('should handle errors during client removal', async () => {
      const error = new Error('Removal failed');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove(companyId, clientId)).rejects.toThrow(
        error,
      );
    });
  });
});
