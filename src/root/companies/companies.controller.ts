import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@/entities/company.entity';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'Returns all companies',
    type: [Company],
  })
  findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Company UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the company',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: Company,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Company UUID' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.companiesService.remove(id);
    return { message: 'Company deleted successfully' };
  }
}
