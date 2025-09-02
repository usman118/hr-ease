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

  async getAllUsers(): Promise<User[]> {
    return await this.userRepo.find({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllCompanies() {
    return await this.companyRepo.find({
      relations: ['owner'],
      select: {
        id: true,
        name: true,
        industry: true,
        website: true,
        description: true,
        address: true,
        city: true,
        country: true,
        createdAt: true,
        owner: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
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
