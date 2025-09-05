import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/user.enum';
import { AuthHelper } from '@/helpers';
import { EmailService } from '@/services/email.service';
import { UserInvitationTemplate } from '@/templates/user-invitation.template';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHrUserDto, InviteHrUserDto } from './dto/company-owner.dto';

@Injectable()
export class CompanyOwnerService {
  private readonly logger = new Logger(CompanyOwnerService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(CompanyHr)
    private companyHrRepo: Repository<CompanyHr>,
    private emailService: EmailService,
  ) {}

  async getMyCompany(ownerId: string): Promise<Company | null> {
    return await this.companyRepo.findOne({
      where: { ownerId },
      relations: ['owner'],
    });
  }

  async createHrUser(
    createHrUserDto: CreateHrUserDto,
    companyOwner: User,
  ): Promise<{ user: User; tempPassword: string }> {
    const { email, firstName, lastName } = createHrUserDto;

    // Get the company this owner manages
    const company = await this.getMyCompany(companyOwner.id);
    if (!company) {
      throw new BadRequestException(
        'You must be assigned to a company to create HR users',
      );
    }

    // Check if email is already in use
    await AuthHelper.checkEmailAvailability(this.userRepo, email);

    // Generate temporary password
    const temporaryPassword = AuthHelper.generateRandomToken(12);
    const hashedPassword = await AuthHelper.hashPassword(temporaryPassword);

    // Log temporary password for testing
    this.logger.log(`HR temporary password for ${email}: ${temporaryPassword}`);

    // Create HR user
    const hrUser = this.userRepo.create({
      email,
      firstName,
      lastName,
      role: UserRole.HR,
      password: hashedPassword,
      isActive: true,
    });

    const savedUser = await this.userRepo.save(hrUser);

    // Create company-HR relationship
    const companyHr = this.companyHrRepo.create({
      companyId: company.id,
      hrId: savedUser.id,
    });
    await this.companyHrRepo.save(companyHr);

    return {
      user: savedUser,
      tempPassword: temporaryPassword,
    };
  }

  async inviteHrUser(
    inviteHrUserDto: InviteHrUserDto,
    companyOwner: User,
  ): Promise<User> {
    const { email, firstName, lastName } = inviteHrUserDto;

    // Create the HR user first and get the temporary password
    const result = await this.createHrUser(
      { email, firstName, lastName },
      companyOwner,
    );

    const hrUser = result.user;
    const temporaryPassword = result.tempPassword;

    // Get company information for email
    const company = await this.getMyCompany(companyOwner.id);

    // Send invitation email
    try {
      const emailData = {
        firstName: hrUser.firstName,
        lastName: hrUser.lastName,
        email: hrUser.email,
        role: hrUser.role,
        companyName: company?.name,
        temporaryPassword,
        loginUrl: `${process.env.FRONTEND_URL}/auth/login`,
        invitedBy: `${companyOwner.firstName} ${companyOwner.lastName} (${company?.name})`,
      };

      await this.emailService.sendEmail({
        to: hrUser.email,
        subject: `Welcome to ${company?.name} - HR Team Invitation`,
        text: UserInvitationTemplate.getText(emailData),
        html: UserInvitationTemplate.getHtml(emailData),
      });
    } catch (error) {
      this.logger.error('Failed to send HR invitation email:', error);
      // Don't fail the user creation if email fails
    }

    return hrUser;
  }

  async getMyHrUsers(companyOwner: User): Promise<User[]> {
    // Get the company this owner manages
    const company = await this.getMyCompany(companyOwner.id);
    if (!company) {
      throw new BadRequestException(
        'You must be assigned to a company to view HR users',
      );
    }

    // Get all HR users for this company
    const companyHrs = await this.companyHrRepo.find({
      where: { companyId: company.id },
      relations: ['hr'],
      select: {
        hr: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      },
    });

    return companyHrs.map((ch) => ch.hr);
  }

  async removeHrUser(hrUserId: string, companyOwner: User): Promise<void> {
    // Get the company this owner manages
    const company = await this.getMyCompany(companyOwner.id);
    if (!company) {
      throw new BadRequestException(
        'You must be assigned to a company to manage HR users',
      );
    }

    // Find the company-HR relationship
    const companyHr = await this.companyHrRepo.findOne({
      where: { companyId: company.id, hrId: hrUserId },
      relations: ['hr'],
    });

    if (!companyHr) {
      throw new BadRequestException(
        'HR user not found or not assigned to your company',
      );
    }

    // Remove the relationship (but keep the user account active)
    await this.companyHrRepo.remove(companyHr);

    // Optionally deactivate the user account
    // const hrUser = companyHr.hr;
    // hrUser.isActive = false;
    // await this.userRepo.save(hrUser);
  }

  async getCompanyStats(companyOwner: User) {
    const company = await this.getMyCompany(companyOwner.id);
    if (!company) {
      throw new BadRequestException(
        'You must be assigned to a company to view statistics',
      );
    }

    const hrCount = await this.companyHrRepo.count({
      where: { companyId: company.id },
    });

    return {
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        createdAt: company.createdAt,
      },
      hrCount,
      // Add more stats as needed
    };
  }
}
