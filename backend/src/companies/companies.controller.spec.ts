import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@prisma/client';

// Define the delete response type
interface DeleteCompanyResponse {
  success: boolean;
  message: string;
  deletedCompany: Company & { deletedAt: string };
}

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: jest.Mocked<CompaniesService>;

  const mockRequest = {
    user: {
      id: 'user-id',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  };

  const mockCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findCurrent: jest.fn(),
    update: jest.fn(),
    updateCurrent: jest.fn(),
    remove: jest.fn(),
    removeCurrent: jest.fn(),
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
    service = module.get(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const expectedResult: Company[] = [
        {
          id: 'company1',
          name: 'Company 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'company2',
          name: 'Company 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const companyId = 'company-id';

    it('should return a company', async () => {
      const expectedResult: Company = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findOne(mockRequest, companyId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findCurrent', () => {
    const companyId = 'company-id';

    it('should return the current company', async () => {
      const expectedResult: Company = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findCurrent(mockRequest, companyId);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(companyId);
    });
  });

  describe('update', () => {
    const companyId = 'company-id';
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Updated Company',
    };

    it('should update a company', async () => {
      const expectedResult: Company = {
        id: companyId,
        name: updateCompanyDto.name!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.update(
        mockRequest,
        companyId,
        updateCompanyDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(companyId, updateCompanyDto);
    });
  });

  describe('updateCurrent', () => {
    const companyId = 'company-id';
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Updated Company',
    };

    it('should update the current company', async () => {
      const expectedResult: Company = {
        id: companyId,
        name: updateCompanyDto.name!,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.updateCurrent(
        mockRequest,
        companyId,
        updateCompanyDto,
      );

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(companyId, updateCompanyDto);
    });
  });

  describe('remove', () => {
    const companyId = 'company-id';

    it('should remove a company', async () => {
      const deletedCompany: Company = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResponse: DeleteCompanyResponse = {
        success: true,
        message: 'Company deleted successfully',
        deletedCompany: {
          ...deletedCompany,
          deletedAt: expect.any(String),
        },
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResponse);

      const result = await controller.remove(mockRequest, companyId);

      expect(result).toEqual(expectedResponse);
      expect(service.remove).toHaveBeenCalledWith(companyId);
    });
  });

  describe('removeCurrent', () => {
    const companyId = 'company-id';

    it('should remove the current company', async () => {
      const deletedCompany: Company = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResponse: DeleteCompanyResponse = {
        success: true,
        message: 'Company deleted successfully',
        deletedCompany: {
          ...deletedCompany,
          deletedAt: expect.any(String),
        },
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResponse);

      const result = await controller.removeCurrent(mockRequest, companyId);

      expect(result).toEqual(expectedResponse);
      expect(service.remove).toHaveBeenCalledWith(companyId);
    });
  });
});
