import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;

  const mockCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of companies', async () => {
      const expectedResult = [
        { 
          id: 'company-1',
          name: 'Company 1',
          users: [],
          clients: [],
          preferences: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          id: 'company-2',
          name: 'Company 2',
          users: [],
          clients: [],
          preferences: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single company', async () => {
      const companyId = 'company-id';
      const expectedResult = { 
        id: companyId,
        name: 'Test Company',
        users: [],
        clients: [],
        preferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findOne(companyId);

      expect(result).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findCurrent', () => {
    it('should return the current company', async () => {
      const companyId = 'company-id';
      const expectedResult = { 
        id: companyId,
        name: 'Test Company',
        users: [],
        clients: [],
        preferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findCurrent(companyId);

      expect(result).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(companyId);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const companyId = 'company-id';
      const updateCompanyDto = { name: 'Updated Company' };
      const expectedResult = { 
        id: companyId,
        name: 'Updated Company',
        users: [],
        clients: [],
        preferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.update(companyId, updateCompanyDto);

      expect(result).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith(companyId, updateCompanyDto);
    });
  });

  describe('updateCurrent', () => {
    it('should update the current company', async () => {
      const companyId = 'company-id';
      const updateCompanyDto = { name: 'Updated Company' };
      const expectedResult = { 
        id: companyId,
        name: 'Updated Company',
        users: [],
        clients: [],
        preferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.updateCurrent(companyId, updateCompanyDto);

      expect(result).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith(companyId, updateCompanyDto);
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      const companyId = 'company-id';
      const expectedResult = { 
        id: companyId,
        name: 'Test Company',
        users: [],
        clients: [],
        preferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      const result = await controller.remove(companyId);

      expect(result).toBe(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(companyId);
    });
  });

  describe('removeCurrent', () => {
    it('should remove the current company', async () => {
      const companyId = 'company-id';
      const expectedResult = { 
        id: companyId,
        name: 'Test Company',
        users: [],
        clients: [],
        preferences: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      const result = await controller.removeCurrent(companyId);

      expect(result).toBe(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(companyId);
    });
  });
});
