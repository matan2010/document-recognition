import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Company = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(`[CompanyDecorator] Extracting company from token in request:, ${JSON.stringify({
      companyId: request.user?.companyId
    })}`);
    
    return request.user?.companyId;
  },
);
