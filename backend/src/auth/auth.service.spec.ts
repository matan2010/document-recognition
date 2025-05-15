import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { BootstrapDto } from './dto/bootstrap.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { User } from '@prisma/client';

// Mock bcrypt
jest.mock('bcrypt');

// Mock implementations
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
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

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

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
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    beforeEach(() => {
      // Reset bcrypt mock before each test
      (bcrypt.compare as jest.Mock).mockReset();
    });

    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashedPassword123';
    const mockUser = {
      id: 'user123',
      email: mockEmail,
      password: mockHashedPassword,
      role: Role.NORMAL,
    };

    it('should validate user successfully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(mockEmail, mockPassword);

      // Assert
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.email).toBe(mockEmail);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateUser(mockEmail, mockPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.validateUser(mockEmail, mockPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty password gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockClear();

      // Act & Assert
      await expect(
        service.validateUser(mockEmail, ''),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty email gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockClear();

      // Act & Assert
      await expect(
        service.validateUser('', mockPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle bcrypt errors gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      // Act & Assert
      await expect(
        service.validateUser(mockEmail, mockPassword),
      ).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.validateUser(mockEmail, mockPassword),
      ).rejects.toThrow();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.validateUser(mockEmail, mockPassword),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockJwtService.sign.mockClear();
      mockPrismaService.refreshToken.create.mockClear();
    });

    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: Role.NORMAL,
      companyId: 'company123',
    };

    it('should login user successfully', async () => {
      // Arrange
      const mockTokens = {
        access_token: 'access123',
        refresh_token: 'refresh123',
      };
      mockJwtService.sign.mockReturnValue(mockTokens.access_token);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: expect.any(String),
        user: mockUser,
      });
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });

    it('should handle null user data gracefully', async () => {
      // Act & Assert
      await expect(service.login(null)).rejects.toThrow();
    });

    it('should handle missing user properties gracefully', async () => {
      // Arrange
      const incompleteUser = { id: 'user123' };
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('Invalid user data');
      });

      // Act & Assert
      await expect(service.login(incompleteUser)).rejects.toThrow();
    });

    it('should handle JWT signing errors', async () => {
      // Arrange
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      // Act & Assert
      await expect(service.login(mockUser)).rejects.toThrow();
    });

    it('should handle refresh token creation failure', async () => {
      // Arrange
      mockJwtService.sign.mockReturnValue('access123');
      mockPrismaService.refreshToken.create.mockRejectedValue(
        new Error('Failed to create refresh token'),
      );

      // Act & Assert
      await expect(service.login(mockUser)).rejects.toThrow();
    });

    it('should login user successfully', async () => {
      // Arrange
      const mockTokens = {
        access_token: 'access123',
        refresh_token: 'refresh123',
      };
      mockJwtService.sign.mockReturnValue(mockTokens.access_token);
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: expect.any(String),
        user: mockUser,
      });
      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      mockPrismaService.$transaction.mockClear();
      mockJwtService.sign.mockClear();
    });

    const mockRefreshToken = 'refresh123';
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: Role.NORMAL,
      companyId: 'company123',
    };

    it('should refresh token successfully', async () => {
      // Arrange
      const mockSavedToken = {
        id: 'token123',
        token: mockRefreshToken,
        user: mockUser,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockSavedToken);
      mockJwtService.sign.mockReturnValue('newAccessToken');
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      // Act
      const result = await service.refreshToken(mockRefreshToken);

      // Assert
      expect(result).toEqual({
        access_token: 'newAccessToken',
        refresh_token: expect.any(String),
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          companyId: mockUser.companyId,
        },
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      // Arrange
      const mockSavedToken = {
        id: 'token123',
        token: mockRefreshToken,
        user: mockUser,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockSavedToken);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      // Arrange
      const mockSavedToken = {
        id: 'token123',
        token: mockRefreshToken,
        user: mockUser,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockSavedToken);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle transaction failures during token refresh', async () => {
      // Arrange
      const mockSavedToken = {
        id: 'token123',
        token: mockRefreshToken,
        user: mockUser,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockSavedToken);
      mockPrismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow();
    });

    it('should handle malformed refresh tokens', async () => {
      // Act & Assert
      await expect(service.refreshToken('')).rejects.toThrow();
      await expect(service.refreshToken(null)).rejects.toThrow();
      await expect(service.refreshToken(undefined)).rejects.toThrow();
    });

    it('should handle corrupted user data in token', async () => {
      // Arrange
      const mockSavedToken = {
        id: 'token123',
        token: mockRefreshToken,
        user: null, // Corrupted user data
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockSavedToken);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow();
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      // Arrange
      const mockSavedToken = {
        id: 'token123',
        token: mockRefreshToken,
        user: mockUser,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000000),
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockSavedToken);

      // Act & Assert
      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const mockUserId = 'user123';

    it('should logout user successfully', async () => {
      // Arrange
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      // Act
      await service.logout(mockUserId);

      // Assert
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should handle logout when no active tokens exist', async () => {
      // Arrange
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      // Act
      await service.logout(mockUserId);

      // Assert
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('bootstrap', () => {
    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockClear();
      mockPrismaService.company.create.mockClear();
    });

    const mockBootstrapDto = {
      companyName: 'Test Company',
      adminEmail: 'admin@example.com',
      adminPassword: 'admin123',
    };

    it('should bootstrap system successfully', async () => {
      // Arrange
      const mockHashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

      const mockCreatedCompany = {
        id: 'company123',
        name: mockBootstrapDto.companyName,
        users: [
          {
            id: 'user123',
            email: mockBootstrapDto.adminEmail,
            password: mockHashedPassword,
            role: Role.ADMIN,
          },
        ],
      };

      mockPrismaService.company.create.mockResolvedValue(mockCreatedCompany);
      mockJwtService.sign.mockReturnValue('access123');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      // Act
      const result = await service.bootstrap(mockBootstrapDto);

      // Assert
      expect(result).toEqual({
        company: {
          id: mockCreatedCompany.id,
          name: mockCreatedCompany.name,
        },
        user: {
          id: mockCreatedCompany.users[0].id,
          email: mockCreatedCompany.users[0].email,
          role: mockCreatedCompany.users[0].role,
        },
        access_token: 'access123',
        refresh_token: expect.any(String),
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockBootstrapDto.adminPassword,
        10,
      );
      expect(mockPrismaService.company.create).toHaveBeenCalledWith({
        data: {
          name: mockBootstrapDto.companyName,
          users: {
            create: {
              email: mockBootstrapDto.adminEmail,
              password: mockHashedPassword,
              role: Role.ADMIN,
            },
          },
        },
        include: {
          users: true,
        },
      });
    });

    it('should throw UnauthorizedException when bootstrap fails', async () => {
      // Arrange
      mockPrismaService.company.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.bootstrap(mockBootstrapDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle password hashing failures', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Act & Assert
      await expect(service.bootstrap(mockBootstrapDto)).rejects.toThrow('Failed to create company');
    });

    it('should handle empty or invalid bootstrap data', async () => {
      // Act & Assert
      await expect(service.bootstrap(null as any)).rejects.toThrow();
      await expect(service.bootstrap({} as BootstrapDto)).rejects.toThrow();
      await expect(service.bootstrap({ companyName: '', adminEmail: '', adminPassword: '' } as BootstrapDto)).rejects.toThrow();
    });

    it('should handle company creation with no users', async () => {
      // Arrange
      const mockCreatedCompany = {
        id: 'company123',
        name: mockBootstrapDto.companyName,
        users: [], // Empty users array
      };
      mockPrismaService.company.create.mockResolvedValue(mockCreatedCompany);

      // Act & Assert
      await expect(service.bootstrap(mockBootstrapDto)).rejects.toThrow();
    });

    it('should validate admin password strength', async () => {
      // Arrange
      const weakPasswordDto = {
        ...mockBootstrapDto,
        adminPassword: '123', // Too short/weak password
      };

      // Act & Assert
      await expect(service.bootstrap(weakPasswordDto)).rejects.toThrow();
    });

    it('should throw UnauthorizedException when bootstrap fails', async () => {
      // Arrange
      mockPrismaService.company.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.bootstrap(mockBootstrapDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
