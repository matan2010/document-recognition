import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Company } from '../auth/decorators/company.decorator';
import { Request } from '@nestjs/common';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Request() req, @Body() createCompanyDto: CreateCompanyDto) {
    try {
      // Only ADMIN users can create new companies
      if (req.user.role !== 'admin') {
        console.log(`[CompaniesController] Unauthorized create attempt: ${JSON.stringify({
          userId: req.user.userId,
          role: req.user.role
        })}`);
        throw new UnauthorizedException('Only admin users can create new companies');
      }

      console.log(`[CompaniesController] Creating company: ${JSON.stringify({ 
        dto: createCompanyDto,
        createdBy: req.user.userId
      })}`);

      return await this.companiesService.create(createCompanyDto, req.user.userId);
    } catch (error) {
      console.error(`[CompaniesController] Error creating company: ${JSON.stringify({ error })}`);
      throw error instanceof UnauthorizedException 
        ? error 
        : new InternalServerErrorException('Failed to create company');
    }
  }

  @Get()
  async findAll(@Request() req) {
    try {
      // Only ADMIN users can see all companies
      if (req.user.role !== 'admin') {
        console.log(`[CompaniesController] Unauthorized findAll attempt: ${JSON.stringify({
          userId: req.user.userId,
          role: req.user.role
        })}`);
        throw new UnauthorizedException('Only admin users can view all companies');
      }

      console.log(`[CompaniesController] Finding all companies`);
      return await this.companiesService.findAll();
    } catch (error) {
      console.error(`[CompaniesController] Error finding companies: ${JSON.stringify({ error })}`);
      throw error instanceof UnauthorizedException 
        ? error 
        : new InternalServerErrorException('Failed to find companies');
    }
  }

  @Get('current')
  async findCurrent(@Company() companyId: string) {
    try {
      console.log(`[CompaniesController] Finding current company: ${JSON.stringify({ companyId })}`);
      return await this.companiesService.findOne(companyId);
    } catch (error) {
      console.error(`[CompaniesController] Error finding current company: ${JSON.stringify({ error })}`);
      throw new InternalServerErrorException('Failed to find current company');
    }
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    try {
      // Only ADMIN users can see other companies
      if (req.user.role !== 'admin' && id !== req.user.companyId) {
        console.log(`[CompaniesController] Unauthorized findOne attempt: ${JSON.stringify({
          userId: req.user.userId,
          role: req.user.role,
          requestedCompanyId: id
        })}`);
        throw new UnauthorizedException('You can only view your own company');
      }

      console.log(`[CompaniesController] Finding company: ${JSON.stringify({ id })}`);
      return await this.companiesService.findOne(id);
    } catch (error) {
      console.error(`[CompaniesController] Error finding company: ${JSON.stringify({ error })}`);
      throw error instanceof UnauthorizedException 
        ? error 
        : new InternalServerErrorException('Failed to find company');
    }
  }

  @Patch('current')
  async updateCurrent(@Company() companyId: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    try {
      console.log(`[CompaniesController] Updating current company: ${JSON.stringify({ companyId, dto: updateCompanyDto })}`);
      return await this.companiesService.update(companyId, updateCompanyDto);
    } catch (error) {
      console.error(`[CompaniesController] Error updating current company: ${JSON.stringify({ error })}`);
      throw new InternalServerErrorException('Failed to update current company');
    }
  }
  
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    try {
      // Only ADMIN users can update other companies
      if (req.user.role !== 'admin' && id !== req.user.companyId) {
        console.log(`[CompaniesController] Unauthorized update attempt: ${JSON.stringify({
          userId: req.user.userId,
          role: req.user.role,
          requestedCompanyId: id
        })}`);
        throw new UnauthorizedException('You can only update your own company');
      }

      console.log(`[CompaniesController] Updating company: ${JSON.stringify({ id, dto: updateCompanyDto })}`);
      return await this.companiesService.update(id, updateCompanyDto);
    } catch (error) {
      console.error(`[CompaniesController] Error updating company: ${JSON.stringify({ error })}`);
      throw error instanceof UnauthorizedException 
        ? error 
        : new InternalServerErrorException('Failed to update company');
    }
  }

  @Delete('current')
  async removeCurrent(@Company() companyId: string) {
    try {
      console.log(`[CompaniesController] Removing current company: ${JSON.stringify({ companyId })}`);
      return await this.companiesService.remove(companyId);
    } catch (error) {
      console.error(`[CompaniesController] Error removing current company: ${JSON.stringify({ error })}`);
      throw new InternalServerErrorException('Failed to remove current company');
    }
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    try {
      // Only ADMIN users can delete companies
      if (req.user.role !== 'admin') {
        console.log(`[CompaniesController] Unauthorized delete attempt: ${JSON.stringify({
          userId: req.user.userId,
          role: req.user.role,
          requestedCompanyId: id
        })}`);
        throw new UnauthorizedException('Only admin users can delete companies');
      }

      console.log(`[CompaniesController] Removing company: ${JSON.stringify({ id })}`);
      return await this.companiesService.remove(id);
    } catch (error) {
      console.error(`[CompaniesController] Error removing company: ${JSON.stringify({ error })}`);
      throw error instanceof UnauthorizedException 
        ? error 
        : new InternalServerErrorException('Failed to remove company');
    }
  }
}
