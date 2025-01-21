import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;

        if (params.companyId) {
            const company = await this.prisma.company.findUnique({
                where: { id: params.companyId },
            });
            return company?.id === user.companyId;
        }
        return true;
    }
}
