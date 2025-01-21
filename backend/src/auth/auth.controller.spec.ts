import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    // Set required environment variables for testing
    process.env.JWT_SECRET = 'test-secret';
    process.env.MONGODB_URI = 'mongodb://test:test@localhost:27017/test';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              create: jest.fn(),
            },
            $connect: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.MONGODB_URI;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('bootstrap', () => {
    it('should create a company and return token', async () => {
      const dto = { name: 'Test Company' };
      const result = {
        company: {
          id: 'test-id',
          name: 'Test Company',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        access_token: 'test-token',
      };

      jest.spyOn(service, 'bootstrap').mockResolvedValue(result);

      expect(await controller.bootstrap(dto)).toBe(result);
      expect(service.bootstrap).toHaveBeenCalledWith(dto);
    });

    it('should handle errors', async () => {
      const dto = { name: 'Test Company' };
      jest.spyOn(service, 'bootstrap').mockRejectedValue(new Error('Test error'));

      await expect(controller.bootstrap(dto)).rejects.toThrow('Failed to create company');
    });
  });

  describe('verifyToken', () => {
    it('should return company id when token is valid', async () => {
      const companyId = 'test-id';
      const result = await controller.verifyToken(companyId);
      
      expect(result).toEqual({
        companyId,
        verified: true,
      });
    });
  });
});
