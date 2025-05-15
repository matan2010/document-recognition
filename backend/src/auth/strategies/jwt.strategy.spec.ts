import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw error if JWT_SECRET is not set', async () => {
    delete process.env.JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null)
          }
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn()
            }
          }
        }
      ]
    }).compile();

    expect(() => module.get<JwtStrategy>(JwtStrategy)).toThrow('JWT_SECRET environment variable is not set');
  });

  it('should validate and return payload with companyId', async () => {
    const payload = { companyId: 'test-company-id' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ companyId: 'test-company-id' });
  });
});
