import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/user.enum';
import { AuthHelper } from '@/helpers';
import {
  AssignCompanyDto,
  CreateUserDto,
  InviteUserDto,
} from '@/root/auth/dto/admin-user.dto';
import { EmailService } from '@/services/email.service';
import { UserInvitationTemplate } from '@/templates/user-invitation.template';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(CompanyHr)
    private companyHrRepo: Repository<CompanyHr>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    _adminUser: User,
  ): Promise<{ user: User; tempPassword: string }> {
    const { email, firstName, lastName, role } = createUserDto;

    // Check if email is already in use
    await AuthHelper.checkEmailAvailability(this.userRepo, email);

    // Generate temporary password
    const temporaryPassword = AuthHelper.generateRandomToken(12);
    const hashedPassword = await AuthHelper.hashPassword(temporaryPassword);

    // Log temporary password for testing purposes
    this.logger.log(`Temporary password for ${email}: ${temporaryPassword}`);

    // Create user
    const user = this.userRepo.create({
      email,
      firstName,
      lastName,
      role,
      password: hashedPassword,
      isActive: true,
    });

    const savedUser = await this.userRepo.save(user);

    return {
      user: savedUser,
      tempPassword: temporaryPassword,
    };
  }

  async inviteUser(
    inviteUserDto: InviteUserDto,
    adminUser: User,
  ): Promise<User> {
    const { email, firstName, lastName, role, companyId } = inviteUserDto;

    // Check if email is already in use
    await AuthHelper.checkEmailAvailability(this.userRepo, email);

    // Generate temporary password
    const temporaryPassword = AuthHelper.generateRandomToken(12);
    const hashedPassword = await AuthHelper.hashPassword(temporaryPassword);

    // Create user
    const user = this.userRepo.create({
      email,
      firstName,
      lastName,
      role,
      password: hashedPassword,
      isActive: true,
    });

    const savedUser = await this.userRepo.save(user);

    // Handle company assignment if provided
    let companyName = '';
    if (
      companyId &&
      (role === UserRole.COMPANY_OWNER || role === UserRole.HR)
    ) {
      const company = await this.companyRepo.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new BadRequestException('Company not found');
      }
      companyName = company.name;

      // Create relationship based on role
      if (role === UserRole.HR) {
        const companyHr = this.companyHrRepo.create({
          companyId: company.id,
          hrId: savedUser.id,
        });
        await this.companyHrRepo.save(companyHr);
      } else if (role === UserRole.COMPANY_OWNER) {
        // Update company owner
        company.ownerId = savedUser.id;
        await this.companyRepo.save(company);
      }
    }

    // Send invitation email
    try {
      const emailData = {
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        role: savedUser.role,
        companyName: companyName || undefined,
        temporaryPassword,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login`,
        invitedBy: `${adminUser.firstName} ${adminUser.lastName}`,
      };

      await this.emailService.sendEmail({
        to: savedUser.email,
        subject: 'Welcome to HR Ease - Account Invitation',
        text: UserInvitationTemplate.getText(emailData),
        html: UserInvitationTemplate.getHtml(emailData),
      });
    } catch (error) {
      this.logger.error('Failed to send invitation email:', error);
      // Don't fail the user creation if email fails
    }

    return savedUser;
  }

  async assignCompanyToUser(
    userId: string,
    assignCompanyDto: AssignCompanyDto,
    _adminUser: User,
  ): Promise<void> {
    const { companyId } = assignCompanyDto;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Only allow assignment to HR or COMPANY_OWNER roles
    if (user.role !== UserRole.HR && user.role !== UserRole.COMPANY_OWNER) {
      throw new BadRequestException(
        'Company can only be assigned to HR or Company Owner users',
      );
    }

    if (user.role === UserRole.COMPANY_OWNER) {
      // Update company owner
      company.ownerId = user.id;
      await this.companyRepo.save(company);
    } else if (user.role === UserRole.HR) {
      // Check if relationship already exists
      const existingRelation = await this.companyHrRepo.findOne({
        where: { companyId: companyId, hrId: userId },
      });

      if (!existingRelation) {
        const companyHr = this.companyHrRepo.create({
          companyId,
          hrId: userId,
        });
        await this.companyHrRepo.save(companyHr);
      }
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    lazy: boolean = false,
  ): Promise<PaginatedResponse<User>> {
    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.isActive',
        'user.createdAt',
      ])
      .orderBy('user.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // If lazy loading is enabled, return all records without pagination
    if (lazy) {
      const users = await queryBuilder.getMany();
      return {
        data: users,
        total: users.length,
        page: 1,
        limit: users.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async getAllCompanies(
    page: number = 1,
    limit: number = 10,
    search?: string,
    lazy: boolean = false,
  ): Promise<PaginatedResponse<Company>> {
    const queryBuilder = this.companyRepo
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.owner', 'owner')
      .select([
        'company.id',
        'company.name',
        'company.industry',
        'company.website',
        'company.description',
        'company.address',
        'company.city',
        'company.country',
        'company.createdAt',
        'owner.id',
        'owner.firstName',
        'owner.lastName',
        'owner.email',
      ])
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

  async assignCompanyOwner(
    companyId: string,
    userId: string,
    _adminUser: User,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role !== UserRole.COMPANY_OWNER) {
      throw new BadRequestException('User must have COMPANY_OWNER role');
    }

    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    company.ownerId = user.id;
    await this.companyRepo.save(company);
  }
}
