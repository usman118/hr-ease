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

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find({
      relations: ['owner'],
    });
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
