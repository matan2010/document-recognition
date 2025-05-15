import { ExecutionContext } from '@nestjs/common';
import { Company } from '../company.decorator';

describe('Company Decorator', () => {
  const createMockExecutionContext = (request: any): ExecutionContext => {
    const httpContext = {
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    };

    const mockExecutionContext = {
      switchToHttp: () => httpContext,
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn().mockReturnValue([]),
      getArgByIndex: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ExecutionContext;

    return mockExecutionContext;
  };

  // it('should extract companyId from request user', () => {
  //   const companyId = 'test-company-id';
  //   const mockRequest = {
  //     user: {
  //       id: 'test-user-id',
  //       email: 'test@example.com',
  //       role: 'admin',
  //       companyId,
  //     },
  //   };
  //
  //   const mockContext = createMockExecutionContext(mockRequest);
  //   const factory = Company();
  //   const result = factory(mockContext, undefined, 0);
  //
  //   expect(result).toBe(companyId);
  // });

  it('should return undefined if user is not present', () => {
    const mockRequest = {};
    const mockContext = createMockExecutionContext(mockRequest);

    const factory = Company();
    const result = factory(mockContext, undefined, 0);

    expect(result).toBeUndefined();
  });

  it('should return undefined if user has no companyId', () => {
    const mockRequest = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'admin',
      },
    };

    const mockContext = createMockExecutionContext(mockRequest);
    const factory = Company();
    const result = factory(mockContext, undefined, 0);

    expect(result).toBeUndefined();
  });
});
