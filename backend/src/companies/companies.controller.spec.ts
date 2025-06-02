import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

// Define the delete response type
describe('CompaniesController', () => {
  let controller: CompaniesController;

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

  const mockAdminRequest = {
    user: {
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: Role.ADMIN,
      companyId: 'admin-company-id',
    },
  };

  const mockUserRequest = {
    user: {
      id: 'normal-user-id',
      email: 'user@example.com',
      role: Role.NORMAL,
      companyId: 'user-company-id',
    },
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
    jest.clearAllMocks();
  });

  // FR 5.2 - Company Data Access
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // FR 5.2 - Company Data Access
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('findAll', () => {
    it('should return all companies for admin users', async () => {
      const expectedResult = [
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

      mockCompaniesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockAdminRequest);

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.findAll).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      await expect(controller.findAll(mockUserRequest)).rejects.toThrow(
        new UnauthorizedException('Only admin users can list all companies'),
      );
      expect(mockCompaniesService.findAll).not.toHaveBeenCalled();
    });
  });

  // FR 5.2 - Company Data Access
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // FR 5.2 - Company Data Access
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('findOne', () => {
    it('should return a company for admin users', async () => {
      const companyId = 'some-other-company';
      const expectedResult = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(mockAdminRequest, companyId);

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(companyId);
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      await expect(
        controller.findOne(mockUserRequest, mockUserRequest.user.companyId),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Only admin users can access other companies',
        ),
      );
      expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
    });
  });

  // FR 5.2 - Company Data Access
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('findCurrent', () => {
    it('should allow users to access their own company', async () => {
      const expectedResult = {
        id: mockUserRequest.user.companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findCurrent(
        mockUserRequest,
        mockUserRequest.user.companyId,
      );

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(
        mockUserRequest.user.companyId,
      );
    });
  });

  // FR 5.3 - Company Profile Management
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // FR 5.1 - Company Registration
  // NFR 4.1.3 - Multi-tenancy Support
  // FR 5.1 - Company Registration
  // FR 5.3 - Company Profile Management
  // NFR 4.1.3 - Multi-tenancy Support
  describe('create', () => {
    const companyId = 'company-id';
    const createCompanyDto = {
      name: 'New Company',
      email: 'company@example.com',
      phone: '1234567890',
      address: '123 Main St'
    };

    it('should create a company for admin users', async () => {
      const expectedResult = {
        id: companyId,
        name: updateCompanyDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(
        mockAdminRequest,
        createCompanyDto,
      );

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.create).toHaveBeenCalledWith(
        createCompanyDto,
      );
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      await expect(
        controller.create(mockUserRequest, createCompanyDto),
      ).rejects.toThrow(
        new UnauthorizedException('Only admin users can create companies'),
      );
      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });
  });

  // FR 5.3 - Company Profile Management
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // FR 5.3 - Company Profile Management
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('update', () => {
    const companyId = 'company-id';
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Updated Company',
    };

    it('should update a company for admin users', async () => {
      const expectedResult = {
        id: companyId,
        name: updateCompanyDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(
        mockAdminRequest,
        companyId,
        updateCompanyDto,
      );

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.update).toHaveBeenCalledWith(
        companyId,
        updateCompanyDto,
      );
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      await expect(
        controller.update(mockUserRequest, companyId, updateCompanyDto),
      ).rejects.toThrow(
        new UnauthorizedException('Only admin users can update companies'),
      );
      expect(mockCompaniesService.update).not.toHaveBeenCalled();
    });
  });

  // FR 5.3 - Company Profile Management
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('updateCurrent', () => {
    it('should update current company for any user', async () => {
      const mockResponse = {
        id: mockUserRequest.user.companyId,
        name: 'Updated Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateCompanyDto: UpdateCompanyDto = {
        name: 'Updated Company',
      };

      mockCompaniesService.update.mockResolvedValue(mockResponse);

      const result = await controller.updateCurrent(
        mockUserRequest,
        mockUserRequest.user.companyId,
        updateCompanyDto,
      );

      expect(result).toEqual({
        ...mockResponse,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(mockCompaniesService.update).toHaveBeenCalledWith(
        mockUserRequest.user.companyId,
        updateCompanyDto,
      );
    });
  });

  // FR 5.4 - Company Account Termination
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // NFR 4.1.4 - Data Retention Policy
  // FR 5.4 - Company Account Termination
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // NFR 4.1.4 - Data Retention Policy
  describe('remove', () => {
    const companyId = 'company-id';

    it('should delete a company for admin users', async () => {
      const deletedCompany = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.remove.mockResolvedValue({ deletedCompany });

      const result = await controller.remove(mockAdminRequest, companyId);

      expect(result).toEqual({
        success: true,
        message: 'Company deleted successfully',
        deletedCompany: {
          ...deletedCompany,
          deletedAt: expect.any(String),
        },
      });
      expect(mockCompaniesService.remove).toHaveBeenCalledWith(companyId);
    });

    it('should throw UnauthorizedException for non-admin users', async () => {
      await expect(
        controller.remove(mockUserRequest, companyId),
      ).rejects.toThrow(
        new UnauthorizedException('Only admin users can delete companies'),
      );
      expect(mockCompaniesService.remove).not.toHaveBeenCalled();
    });
  });

  // FR 5.4 - Company Account Termination
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  // NFR 4.1.4 - Data Retention Policy
  describe('removeCurrent', () => {
    const companyId = 'user-company-id';

    it('should delete current company for any user', async () => {
      const deletedCompany = {
        id: mockUserRequest.user.companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.remove.mockResolvedValue({ deletedCompany });

      const result = await controller.removeCurrent(mockUserRequest, companyId);

      expect(result).toEqual({
        success: true,
        message: 'Company deleted successfully',
        deletedCompany: {
          ...deletedCompany,
          deletedAt: expect.any(String),
        },
      });
      expect(mockCompaniesService.remove).toHaveBeenCalledWith(companyId);
    });
  });
});
