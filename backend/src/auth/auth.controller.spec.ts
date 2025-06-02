import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BootstrapDto } from './dto/bootstrap.dto';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    bootstrap: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('bootstrap', () => {
    const bootstrapDto: BootstrapDto = {
      adminEmail: 'admin@example.com',
      adminPassword: 'password123',
      companyName: 'Test Company',
    };

    it('should create initial admin user and company', async () => {
      const expectedResult = {
        user: {
          id: 'user-id',
          email: bootstrapDto.adminEmail,
          role: Role.ADMIN,
          companyId: 'company-id',
        },
        company: {
          id: 'company-id',
          name: bootstrapDto.companyName,
        },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockAuthService.bootstrap.mockResolvedValue(expectedResult);

      const result = await controller.bootstrap(bootstrapDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.bootstrap).toHaveBeenCalledWith(bootstrapDto);
    });

    it('should handle bootstrap errors', async () => {
      mockAuthService.bootstrap.mockRejectedValue(
        new Error('Failed to create company'),
      );

      await expect(controller.bootstrap(bootstrapDto)).rejects.toThrow(
        'Bootstrap failed'
      );
      expect(mockAuthService.bootstrap).toHaveBeenCalledWith(bootstrapDto);
    });
  });

  describe('verifyToken', () => {
    it('should return user data for valid token', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.ADMIN,
          companyId: 'company-id',
        },
      };

      const result = await controller.verifyToken(mockRequest);

      expect(result).toEqual({
        userId: mockRequest.user.id,
        email: mockRequest.user.email,
        role: mockRequest.user.role,
        companyId: mockRequest.user.companyId,
      });
    });

    it('should handle missing user in request', async () => {
      const mockRequest = {};

      await expect(controller.verifyToken(mockRequest)).rejects.toThrow(
        TypeError,
      );
    });

    it('should handle invalid user data', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
        },
      };

      const result = await controller.verifyToken(mockRequest);

      expect(result).toEqual({
        userId: mockRequest.user.id,
        email: undefined,
        role: undefined,
        companyId: undefined,
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return tokens and user data on successful login', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        role: Role.NORMAL,
        companyId: 'company-id',
      };

      const expectedResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: mockUser,
      };

      const mockRequest = { user: mockUser };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(mockRequest, loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should handle login errors', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: loginDto.email,
          role: Role.NORMAL,
          companyId: 'company-id',
        },
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockRequest, loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockRequest.user);
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';

    it('should return new tokens on successful refresh', async () => {
      const expectedResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.NORMAL,
          companyId: 'company-id',
        },
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshToken);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should handle refresh token errors', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.NORMAL,
          companyId: 'company-id',
        },
      };

      const result = await controller.logout(mockRequest);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockRequest.user.id);
    });

    it('should handle logout errors', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: Role.NORMAL,
          companyId: 'company-id',
        },
      };

      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(controller.logout(mockRequest)).rejects.toThrow(Error);
      expect(mockAuthService.logout).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });
});
