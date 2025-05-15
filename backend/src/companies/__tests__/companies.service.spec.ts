import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '../companies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    company: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createCompanyDto = {
      name: 'Test Company',
      address: '123 Test St',
      phone: '1234567890',
    };
    const createdByUserId = 'user123';

    it('should create a company successfully', async () => {
      const expectedCompany = {
        id: 'company123',
        ...createCompanyDto,
        users: [{ id: createdByUserId }],
        documents: [],
      };

      mockPrismaService.company.create.mockResolvedValue(expectedCompany);

      const result = await service.create(createCompanyDto, createdByUserId);

      expect(result).toEqual(expectedCompany);
      expect(mockPrismaService.company.create).toHaveBeenCalledWith({
        data: {
          ...createCompanyDto,
          users: {
            connect: {
              id: createdByUserId,
            },
          },
        },
        include: {
          users: true,
          documents: true,
        },
      });
    });

    it('should propagate errors from prisma', async () => {
      const error = new Error('Database error');
      mockPrismaService.company.create.mockRejectedValue(error);

      await expect(service.create(createCompanyDto, createdByUserId)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const expectedCompanies = [
        { id: 'company1', name: 'Company 1' },
        { id: 'company2', name: 'Company 2' },
      ];

      mockPrismaService.company.findMany.mockResolvedValue(expectedCompanies);

      const result = await service.findAll();

      expect(result).toEqual(expectedCompanies);
      expect(mockPrismaService.company.findMany).toHaveBeenCalledWith({
        include: {
          users: true,
          clients: true,
          documents: {
            include: {
              client: true,
            },
          },
          preferences: true,
        },
      });
    });
  });

  describe('findOne', () => {
    const companyId = 'company123';

    it('should return a specific company', async () => {
      const expectedCompany = {
        id: companyId,
        name: 'Test Company',
      };

      mockPrismaService.company.findUnique.mockResolvedValue(expectedCompany);

      const result = await service.findOne(companyId);

      expect(result).toEqual(expectedCompany);
      expect(mockPrismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: companyId },
        include: {
          users: true,
          clients: true,
          documents: {
            include: {
              client: true,
            },
          },
          preferences: true,
        },
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      await expect(service.findOne(companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const companyId = 'company123';
    const updateCompanyDto = {
      name: 'Updated Company',
      address: 'New Address',
    };

    it('should update a company successfully', async () => {
      const updatedCompany = {
        id: companyId,
        ...updateCompanyDto,
      };

      mockPrismaService.company.update.mockResolvedValue(updatedCompany);

      const result = await service.update(companyId, updateCompanyDto);

      expect(result).toEqual(updatedCompany);
      expect(mockPrismaService.company.update).toHaveBeenCalledWith({
        where: { id: companyId },
        data: updateCompanyDto,
        include: {
          users: true,
          clients: true,
          documents: {
            include: {
              client: true,
            },
          },
          preferences: true,
        },
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.company.update.mockRejectedValue(error);

      await expect(service.update(companyId, updateCompanyDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const companyId = 'company123';

    it('should remove a company successfully', async () => {
      const deletedCompany = {
        id: companyId,
        name: 'Test Company',
      };

      mockPrismaService.company.delete.mockResolvedValue(deletedCompany);

      const result = await service.remove(companyId);

      expect(result).toEqual({ deletedCompany });
      expect(mockPrismaService.company.delete).toHaveBeenCalledWith({
        where: { id: companyId },
      });
    });

    it('should throw NotFoundException when company not found', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('', {
        code: 'P2025',
        clientVersion: '2.0.0',
      });
      mockPrismaService.company.delete.mockRejectedValue(error);

      await expect(service.remove(companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    const userId = 'user123';

    it('should return company for a specific user', async () => {
      const expectedCompany = {
        id: 'company123',
        name: 'Test Company',
        users: [{ id: userId }],
      };

      mockPrismaService.company.findFirst.mockResolvedValue(expectedCompany);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(expectedCompany);
      expect(mockPrismaService.company.findFirst).toHaveBeenCalledWith({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          users: true,
          clients: true,
          documents: {
            include: {
              client: true,
            },
          },
          preferences: true,
        },
      });
    });

    it('should throw NotFoundException when no company found for user', async () => {
      mockPrismaService.company.findFirst.mockResolvedValue(null);

      await expect(service.findByUserId(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 