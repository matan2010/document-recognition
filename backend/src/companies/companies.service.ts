import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto, createdByUserId: string) {
    console.log(`[CompaniesService] Creating company: ${JSON.stringify({ 
      dto: createCompanyDto,
      createdByUserId 
    })}`);

    try {
      const company = await this.prisma.company.create({
        data: {
          ...createCompanyDto,
          users: {
            connect: {
              id: createdByUserId
            }
          }
        },
        include: {
          users: true,
          clients: true,
          preferences: true
        }
      });

      console.log(`[CompaniesService] Company created: ${JSON.stringify({ 
        id: company.id,
        name: company.name,
        userCount: company.users.length
      })}`);

      return company;
    } catch (error) {
      console.error('[CompaniesService] Error creating company:', { error });
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.company.findMany({
        include: {
          users: true,
          clients: true,
          preferences: true
        }
      });
    } catch (error) {
      console.error('[CompaniesService] Error finding companies:', { error });
      throw error;
    }
  }

  async findOne(id: string) {
    if (!id) {
      throw new BadRequestException('Company ID is required');
    }

    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          users: true,
          clients: true,
          preferences: true
        }
      });

      if (!company) {
        console.error('[CompaniesService] Company not found:', { id });
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      return company;
    } catch (error) {
      console.error('[CompaniesService] Error finding company:', { id, error });
      throw error;
    }
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    if (!id) {
      throw new BadRequestException('Company ID is required');
    }

    try {
      // Check if company exists
      await this.findOne(id);

      const updated = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
        include: {
          users: true,
          clients: true,
          preferences: true
        }
      });

      console.log('[CompaniesService] Company updated:', { id });
      return updated;
    } catch (error) {
      console.error('[CompaniesService] Error updating company:', { id, error });
      throw error;
    }
  }

  async remove(id: string) {
    if (!id) {
      throw new BadRequestException('Company ID is required');
    }

    try {
      // Check if company exists
      await this.findOne(id);

      await this.prisma.company.delete({
        where: { id }
      });

      console.log('[CompaniesService] Company deleted:', { id });
      return { message: `Company ${id} deleted successfully` };
    } catch (error) {
      console.error('[CompaniesService] Error deleting company:', { id, error });
      throw error;
    }
  }
}
