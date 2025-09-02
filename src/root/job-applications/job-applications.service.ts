import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { JobApplication } from '@/entities/job-application.entity';
import { JobPost } from '@/entities/job-post.entity';
import { User } from '@/entities/user.entity';
import { Visitor } from '@/entities/visitor.entity';
import { UserRole } from '@/enums/user.enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplyForJobDto } from './dto/apply-for-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>,
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
    @InjectRepository(JobPost)
    private readonly jobPostRepository: Repository<JobPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyHr)
    private readonly companyHrRepository: Repository<CompanyHr>,
  ) {}

  async applyForJob(
    jobId: string,
    applyForJobDto: ApplyForJobDto,
  ): Promise<{ message: string; application: JobApplication }> {
    // Check if job exists and is active
    const jobPost = await this.jobPostRepository.findOne({
      where: { id: jobId, isActive: true },
      relations: ['company'],
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found or is no longer active');
    }

    // Create visitor record (allows duplicates based on different applications)
    const visitor = this.visitorRepository.create({
      firstName: applyForJobDto.firstName,
      lastName: applyForJobDto.lastName,
      email: applyForJobDto.email,
      telephone: applyForJobDto.telephone,
      address: applyForJobDto.address,
      yearsOfExperience: applyForJobDto.yearsOfExperience,
      currentPosition: applyForJobDto.currentPosition,
      linkedinUrl: applyForJobDto.linkedinUrl,
      portfolioUrl: applyForJobDto.portfolioUrl,
      documentUrl: applyForJobDto.documentUrl,
    });

    const savedVisitor = await this.visitorRepository.save(visitor);

    // Create job application
    const jobApplication = this.jobApplicationRepository.create({
      jobId,
      visitorId: savedVisitor.id,
      coverLetter: applyForJobDto.coverLetter,
      notes: applyForJobDto.notes,
      expectedSalary: applyForJobDto.expectedSalary,
    });

    const savedApplication =
      await this.jobApplicationRepository.save(jobApplication);

    // Load the complete application with relations
    const completeApplication = await this.jobApplicationRepository.findOne({
      where: { id: savedApplication.id },
      relations: ['job', 'visitor'],
    });

    return {
      message: 'Application submitted successfully',
      application: completeApplication!,
    };
  }

  async getApplicationsForJob(
    jobId: string,
    userId: string,
  ): Promise<JobApplication[]> {
    // Verify user has access to this job's applications
    await this.verifyJobAccess(jobId, userId);

    return this.jobApplicationRepository.find({
      where: { jobId },
      relations: ['job', 'visitor'],
      order: { appliedAt: 'DESC' },
    });
  }

  async getMyJobApplications(userId: string): Promise<{
    applications: JobApplication[];
    total: number;
  }> {
    const companyId = await this.getUserCompanyId(userId);

    const applications = await this.jobApplicationRepository.find({
      where: {
        job: {
          companyId,
        },
      },
      relations: ['job', 'visitor'],
      order: { appliedAt: 'DESC' },
    });

    return {
      applications,
      total: applications.length,
    };
  }

  async updateApplicationStatus(
    applicationId: string,
    updateDto: UpdateApplicationStatusDto,
    userId: string,
  ): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'visitor'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify user has access to this application
    await this.verifyJobAccess(application.jobId, userId);

    application.status = updateDto.status;
    if (updateDto.hrNotes) {
      application.hrNotes = updateDto.hrNotes;
    }

    return this.jobApplicationRepository.save(application);
  }

  async getApplicationById(
    applicationId: string,
    userId: string,
  ): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'visitor'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify user has access to this application
    await this.verifyJobAccess(application.jobId, userId);

    return application;
  }

  async getApplicationStatistics(userId: string): Promise<{
    totalApplications: number;
    pendingApplications: number;
    reviewingApplications: number;
    shortlistedApplications: number;
    rejectedApplications: number;
    acceptedApplications: number;
    applicationsByJob: { jobTitle: string; count: number }[];
  }> {
    const companyId = await this.getUserCompanyId(userId);

    const applications = await this.jobApplicationRepository.find({
      where: {
        job: {
          companyId,
        },
      },
      relations: ['job'],
    });

    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(
        (app) => app.status === 'pending',
      ).length,
      reviewingApplications: applications.filter(
        (app) => app.status === 'reviewing',
      ).length,
      shortlistedApplications: applications.filter(
        (app) => app.status === 'shortlisted',
      ).length,
      rejectedApplications: applications.filter(
        (app) => app.status === 'rejected',
      ).length,
      acceptedApplications: applications.filter(
        (app) => app.status === 'accepted',
      ).length,
      applicationsByJob: [] as { jobTitle: string; count: number }[],
    };

    // Group applications by job
    const jobApplicationCounts = applications.reduce(
      (acc, app) => {
        const jobTitle = app.job.title;
        acc[jobTitle] = (acc[jobTitle] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    stats.applicationsByJob = Object.entries(jobApplicationCounts).map(
      ([jobTitle, count]) => ({
        jobTitle,
        count,
      }),
    );

    return stats;
  }

  private async verifyJobAccess(jobId: string, userId: string): Promise<void> {
    const userCompanyId = await this.getUserCompanyId(userId);

    const jobPost = await this.jobPostRepository.findOne({
      where: { id: jobId },
    });

    if (!jobPost || jobPost.companyId !== userCompanyId) {
      throw new BadRequestException(
        "You do not have access to this job's applications",
      );
    }
  }

  private async getUserCompanyId(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.COMPANY_OWNER) {
      // For company owners, find the company they own
      const company = await this.companyRepository.findOne({
        where: { ownerId: userId },
      });

      if (!company) {
        throw new BadRequestException('Company not found for company owner');
      }

      return company.id;
    } else if (user.role === UserRole.HR) {
      // For HR users, find the company through CompanyHr table
      const companyHr = await this.companyHrRepository.findOne({
        where: { hrId: userId },
      });

      if (!companyHr) {
        throw new BadRequestException('HR user not assigned to any company');
      }

      return companyHr.companyId;
    } else {
      throw new BadRequestException(
        'User does not have access to company applications',
      );
    }
  }
}
