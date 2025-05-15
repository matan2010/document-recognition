import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';

jest.mock('bcrypt');
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: Role.ADMIN,
    };

    beforeEach(() => {
      (bcrypt.compare as jest.Mock).mockReset();
    });

    it('should validate user with correct credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      const { password, ...expectedResult } = mockUser;

      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: Role.ADMIN,
      companyId: 'company123',
    };

    beforeEach(() => {
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
    });

    it('should generate tokens and return user data', async () => {
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-uuid',
        user: mockUser,
      });

      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    const mockSavedToken = {
      id: 'token123',
      token: 'valid-refresh-token',
      userId: 'user123',
      expiresAt: new Date(Date.now() + 1000000),
      revokedAt: null,
      user: {
        id: 'user123',
        email: 'test@example.com',
        role: Role.ADMIN,
        companyId: 'company123',
      },
    };

    it('should refresh tokens successfully', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockSavedToken,
      );
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);
      mockJwtService.sign.mockReturnValue('new-mock-jwt-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({
        access_token: 'new-mock-jwt-token',
        refresh_token: 'mock-uuid',
        user: {
          id: mockSavedToken.user.id,
          email: mockSavedToken.user.email,
          role: mockSavedToken.user.role,
          companyId: mockSavedToken.user.companyId,
        },
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        ...mockSavedToken,
        revokedAt: new Date(),
      });

      await expect(service.refreshToken('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue({
        ...mockSavedToken,
        expiresAt: new Date(Date.now() - 1000000),
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for user', async () => {
      await service.logout('user123');

      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });
  });

  describe('bootstrap', () => {
    const bootstrapDto = {
      companyName: 'Test Company',
      adminEmail: 'admin@example.com',
      adminPassword: 'password123',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    });

    it('should create company and admin user successfully', async () => {
      const mockCompany = {
        id: 'company123',
        name: bootstrapDto.companyName,
        users: [
          {
            id: 'user123',
            email: bootstrapDto.adminEmail,
            password: 'hashed-password',
            role: Role.ADMIN,
          },
        ],
      };

      mockPrismaService.company.create.mockResolvedValue(mockCompany);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.bootstrap(bootstrapDto);

      expect(result).toEqual({
        company: {
          id: mockCompany.id,
          name: mockCompany.name,
        },
        user: {
          id: mockCompany.users[0].id,
          email: mockCompany.users[0].email,
          role: mockCompany.users[0].role,
          companyId: mockCompany.id,
        },
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-uuid',
      });
    });

    it('should throw UnauthorizedException when bootstrap fails', async () => {
      mockPrismaService.company.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.bootstrap(bootstrapDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
