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

    it('should throw UnauthorizedException for non-admin users accessing other companies', async () => {
      const otherCompanyId = 'other-company-id';

      await expect(
        controller.findOne(mockUserRequest, otherCompanyId),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Only admin users can access other companies',
        ),
      );
      expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
    });

    it('should allow users to access their own company', async () => {
      const expectedResult = {
        id: mockUserRequest.user.companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(
        mockUserRequest,
        mockUserRequest.user.companyId,
      );

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(
        mockUserRequest.user.companyId,
      );
    });
  });

  describe('findCurrent', () => {
    const companyId = 'company-id';

    it('should return the current company', async () => {
      const expectedResult = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findCurrent(mockAdminRequest, companyId);

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(companyId);
    });
  });

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

  describe('updateCurrent', () => {
    const companyId = 'company-id';
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Updated Company',
    };

    it('should update current company for any user', async () => {
      const mockResponse = {
        id: companyId,
        name: updateCompanyDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.updateCurrent.mockResolvedValue(mockResponse);

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

      expect(mockCompaniesService.updateCurrent).toHaveBeenCalledWith(
        mockUserRequest.user.companyId,
        updateCompanyDto,
      );
    });
  });

  describe('remove', () => {
    const companyId = 'company-id';

    it('should delete a company for admin users', async () => {
      const expectedResult = {
        id: companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(mockAdminRequest, companyId);

      expect(result).toEqual(expectedResult);
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

  describe('removeCurrent', () => {
    const companyId = 'company-id';

    it('should delete current company for any user', async () => {
      const expectedResult = {
        id: mockUserRequest.user.companyId,
        name: 'Test Company',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.removeCurrent.mockResolvedValue(expectedResult);

      const result = await controller.removeCurrent(mockUserRequest, companyId);

      expect(result).toEqual(expectedResult);
      expect(mockCompaniesService.removeCurrent).toHaveBeenCalledWith(
        companyId,
      );
    });
  });
});
