import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto, createdByUserId: string): Promise<Company> {
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
          documents: true
        }
      });

      console.log(`[CompaniesService] Company created successfully: ${company.id}`);
      return company;
    } catch (error) {
      console.error(`[CompaniesService] Failed to create company: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({
      include: {
        users: true,
        clients: true,
        documents: {
          include: {
            client: true
          }
        },
        preferences: true
      }
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
        clients: true,
        documents: {
          include: {
            client: true
          }
        },
        preferences: true
      }
    });

    if (!company) {
      throw new NotFoundException(`Company #${id} not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    try {
      return await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
        include: {
          users: true,
          clients: true,
          documents: {
            include: {
              client: true
            }
          },
          preferences: true
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Company #${id} not found`);
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ deletedCompany: Company }> {
    try {
      const deletedCompany = await this.prisma.company.delete({
        where: { id },
      });
      
      return { deletedCompany };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Company #${id} not found`);
        }
      }
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Company> {
    const company = await this.prisma.company.findFirst({
      where: {
        users: {
          some: {
            id: userId
          }
        }
      },
      include: {
        users: true,
        clients: true,
        documents: {
          include: {
            client: true
          }
        },
        preferences: true
      }
    });

    if (!company) {
      throw new NotFoundException(`Company not found for user #${userId}`);
    }

    return company;
  }
}
