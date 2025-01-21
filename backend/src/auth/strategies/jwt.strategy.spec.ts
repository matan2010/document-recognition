import { Test, TestingModule } from '@nestjs/testing';
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

  it('should throw error if JWT_SECRET is not set', () => {
    delete process.env.JWT_SECRET;
    expect(() => new JwtStrategy()).toThrow('JWT_SECRET environment variable is not set');
  });

  it('should validate and return payload with companyId', async () => {
    const payload = { companyId: 'test-company-id' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ companyId: 'test-company-id' });
  });
});
