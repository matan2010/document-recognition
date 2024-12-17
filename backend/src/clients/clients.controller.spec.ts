import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

  const mockClientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a client', async () => {
      const companyId = 'company-id';
      const createClientDto = { 
        name: 'Test Client', 
        email: 'test@example.com',
        companyId: companyId
      };
      const expectedResult = { 
        id: 'client-id', 
        ...createClientDto,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(companyId, createClientDto);

      expect(result).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createClientDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const companyId = 'company-id';
      const expectedResult = [
        { 
          id: 'client-1', 
          name: 'Client 1',
          email: 'client1@example.com',
          companyId: companyId,
          createdAt: new Date(),
          updatedAt: new Date(),
          documents: []
        },
        { 
          id: 'client-2', 
          name: 'Client 2',
          email: 'client2@example.com',
          companyId: companyId,
          createdAt: new Date(),
          updatedAt: new Date(),
          documents: []
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll(companyId);

      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('should return a single client', async () => {
      const companyId = 'company-id';
      const clientId = 'client-id';
      const expectedResult = { 
        id: clientId, 
        name: 'Test Client',
        email: 'test@example.com',
        companyId: companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
        documents: []
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findOne(companyId, clientId);

      expect(result).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(clientId, companyId);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const companyId = 'company-id';
      const clientId = 'client-id';
      const updateClientDto = { name: 'Updated Client' };
      const expectedResult = { 
        id: clientId,
        name: 'Updated Client',
        email: 'test@example.com',
        companyId: companyId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.update(companyId, clientId, updateClientDto);

      expect(result).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith(clientId, updateClientDto, companyId);
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      const companyId = 'company-id';
      const clientId = 'client-id';
      const expectedResult = { 
        id: clientId,
        name: 'Test Client',
        email: 'test@example.com',
        companyId: companyId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      const result = await controller.remove(companyId, clientId);

      expect(result).toBe(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(clientId, companyId);
    });
  });
});
