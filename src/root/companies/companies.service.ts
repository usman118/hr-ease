import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { Company } from '@/entities/company.entity';
import { User } from '@/entities/user.entity';
import { CompanyHelper } from '@/helpers/company.helper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    return CompanyHelper.createCompany(
      this.companyRepository,
      this.userRepository,
      createCompanyDto,
    );
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    lazy: boolean = false,
  ): Promise<PaginatedResponse<Company>> {
    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.owner', 'owner')
      .orderBy('company.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(company.name ILIKE :search OR company.industry ILIKE :search OR company.city ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // If lazy loading is enabled, return all records without pagination
    if (lazy) {
      const companies = await queryBuilder.getMany();
      return {
        data: companies,
        total: companies.length,
        page: 1,
        limit: companies.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [companies, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: companies,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findOne(id: string): Promise<Company> {
    return CompanyHelper.findCompanyById(this.companyRepository, id);
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return CompanyHelper.updateCompany(
      this.companyRepository,
      this.userRepository,
      id,
      updateCompanyDto,
    );
  }

  async remove(id: string): Promise<void> {
    const company = await CompanyHelper.findCompanyById(
      this.companyRepository,
      id,
    );
    await this.companyRepository.remove(company);
  }
}
