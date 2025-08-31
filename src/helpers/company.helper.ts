import { Company } from '@/entities/company.entity';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/user.enum';
import { CreateCompanyDto } from '@/root/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/root/companies/dto/update-company.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class CompanyHelper {
  /**
   * Validate company name uniqueness
   */
  static async validateCompanyNameUniqueness(
    companyRepo: Repository<Company>,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existingCompany = await companyRepo.findOne({
      where: { name },
      withDeleted: true,
    });

    if (existingCompany && existingCompany.id !== excludeId) {
      throw new ConflictException('Company name already exists');
    }
  }

  /**
   * Find company by ID with proper error handling
   */
  static async findCompanyById(
    companyRepo: Repository<Company>,
    id: string,
  ): Promise<Company> {
    const company = await companyRepo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  /**
   * Validate company owner
   */
  static async validateCompanyOwner(
    userRepo: Repository<User>,
    ownerId: string,
  ): Promise<User> {
    const owner = await userRepo.findOne({ where: { id: ownerId } });

    if (!owner) {
      throw new NotFoundException('Company owner not found');
    }

    if (owner.role !== UserRole.COMPANY_OWNER) {
      throw new ConflictException('User must have company_owner role');
    }

    return owner;
  }

  /**
   * Create company with validation
   */
  static async createCompany(
    companyRepo: Repository<Company>,
    userRepo: Repository<User>,
    createCompanyDto: CreateCompanyDto,
  ): Promise<Company> {
    // Validate company name uniqueness
    await this.validateCompanyNameUniqueness(
      companyRepo,
      createCompanyDto.name,
    );

    // Validate owner
    await this.validateCompanyOwner(userRepo, createCompanyDto.ownerId);

    // Create company
    const company = companyRepo.create(createCompanyDto);
    return companyRepo.save(company);
  }

  /**
   * Update company with validation
   */
  static async updateCompany(
    companyRepo: Repository<Company>,
    userRepo: Repository<User>,
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findCompanyById(companyRepo, id);

    // Validate name uniqueness if being updated
    if (updateCompanyDto.name) {
      await this.validateCompanyNameUniqueness(
        companyRepo,
        updateCompanyDto.name,
        id,
      );
    }

    // Validate owner if being updated
    if (updateCompanyDto.ownerId) {
      await this.validateCompanyOwner(userRepo, updateCompanyDto.ownerId);
    }

    Object.assign(company, updateCompanyDto);
    return companyRepo.save(company);
  }

  /**
   * Soft delete company
   */
  static async softDeleteCompany(
    companyRepo: Repository<Company>,
    id: string,
  ): Promise<void> {
    const company = await this.findCompanyById(companyRepo, id);
    await companyRepo.softRemove(company);
  }

  /**
   * Get companies by owner
   */
  static async getCompaniesByOwner(
    companyRepo: Repository<Company>,
    ownerId: string,
  ): Promise<Company[]> {
    return companyRepo.find({
      where: { ownerId },
      relations: ['owner'],
    });
  }

  /**
   * Check if user owns company
   */
  static async checkCompanyOwnership(
    companyRepo: Repository<Company>,
    companyId: string,
    userId: string,
  ): Promise<boolean> {
    const company = await companyRepo.findOne({
      where: { id: companyId, ownerId: userId },
    });
    return !!company;
  }

  /**
   * Format company display name
   */
  static getCompanyDisplayName(company: Company): string {
    return `${company.name} (${company.industry || 'N/A'})`;
  }

  /**
   * Get company size category
   */
  static getCompanySizeCategory(employeeCount?: number): string {
    if (!employeeCount) return 'Unknown';
    if (employeeCount <= 10) return 'Startup';
    if (employeeCount <= 50) return 'Small';
    if (employeeCount <= 250) return 'Medium';
    if (employeeCount <= 1000) return 'Large';
    return 'Enterprise';
  }
}
