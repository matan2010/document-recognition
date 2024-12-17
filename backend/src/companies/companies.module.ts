import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, PrismaService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
