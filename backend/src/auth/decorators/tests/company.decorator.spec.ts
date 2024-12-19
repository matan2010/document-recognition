import { ExecutionContext } from '@nestjs/common';
import { Company } from './company.decorator';

describe('Company Decorator', () => {
  it('should extract companyId from request user', () => {
    const companyId = 'test-company-id';
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { companyId }
        })
      })
    } as ExecutionContext;

    const factory = Company();
    const result = factory(mockExecutionContext,undefined, 0);

    expect(result).toBe(companyId);
  });

  it('should return undefined if user is not present', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({})
      })
    } as ExecutionContext;

    const factory = Company();
    const result = factory(mockExecutionContext,undefined, 0);

    expect(result).toBeUndefined();
  });
});
