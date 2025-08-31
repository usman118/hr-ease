import { JobApplication } from '@/entities/job-application.entity';
import { JobPost } from '@/entities/job-post.entity';
import { Visitor } from '@/entities/visitor.entity';
import { ApplicationStatus } from '@/enums/application.enum';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

export class JobApplicationHelper {
  /**
   * Validate if visitor can apply for job
   */
  static async validateApplicationEligibility(
    jobApplicationRepo: Repository<JobApplication>,
    visitorId: string,
    jobId: string,
  ): Promise<void> {
    const existingApplication = await jobApplicationRepo.findOne({
      where: { visitorId, jobId },
      withDeleted: true,
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }
  }

  /**
   * Validate job exists and is active
   */
  static async validateJobExists(
    jobRepo: Repository<JobPost>,
    jobId: string,
  ): Promise<JobPost> {
    const job = await jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
    return job;
  }

  /**
   * Validate visitor exists
   */
  static async validateVisitorExists(
    visitorRepo: Repository<Visitor>,
    visitorId: string,
  ): Promise<Visitor> {
    const visitor = await visitorRepo.findOne({ where: { id: visitorId } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${visitorId} not found`);
    }
    return visitor;
  }

  /**
   * Find application by ID with proper error handling
   */
  static async findApplicationById(
    jobApplicationRepo: Repository<JobApplication>,
    id: string,
    relations: string[] = ['visitor', 'job'],
  ): Promise<JobApplication> {
    const application = await jobApplicationRepo.findOne({
      where: { id },
      relations,
    });
    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }
    return application;
  }

  /**
   * Create job application with validation
   */
  static async createJobApplication(
    jobApplicationRepo: Repository<JobApplication>,
    jobRepo: Repository<JobPost>,
    visitorRepo: Repository<Visitor>,
    visitorId: string,
    jobPostId: string,
  ): Promise<JobApplication> {
    // Validate eligibility
    await this.validateApplicationEligibility(
      jobApplicationRepo,
      visitorId,
      jobPostId,
    );

    // Validate job and visitor exist
    await this.validateJobExists(jobRepo, jobPostId);
    await this.validateVisitorExists(visitorRepo, visitorId);

    const application = jobApplicationRepo.create({
      jobId: jobPostId,
      visitorId,
      status: ApplicationStatus.PENDING,
    });

    return jobApplicationRepo.save(application);
  }

  /**
   * Update application status with validation
   */
  static async updateApplicationStatus(
    jobApplicationRepo: Repository<JobApplication>,
    id: string,
    status: ApplicationStatus,
  ): Promise<JobApplication> {
    const application = await this.findApplicationById(jobApplicationRepo, id);

    // Validate status transition
    this.validateStatusTransition(application.status, status);

    application.status = status;
    return jobApplicationRepo.save(application);
  }

  /**
   * Validate status transition rules
   */
  static validateStatusTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ): void {
    const invalidTransitions = new Map<ApplicationStatus, ApplicationStatus[]>([
      [ApplicationStatus.ACCEPTED, [ApplicationStatus.PENDING]],
      [
        ApplicationStatus.REJECTED,
        [ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED],
      ],
    ]);

    const disallowedStatuses = invalidTransitions.get(currentStatus) || [];
    if (disallowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Get applications by visitor
   */
  static async getApplicationsByVisitor(
    jobApplicationRepo: Repository<JobApplication>,
    visitorId: string,
  ): Promise<JobApplication[]> {
    return jobApplicationRepo.find({
      where: { visitorId },
      relations: ['job', 'job.company'],
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Get applications by job
   */
  static async getApplicationsByJob(
    jobApplicationRepo: Repository<JobApplication>,
    jobId: string,
  ): Promise<JobApplication[]> {
    return jobApplicationRepo.find({
      where: { jobId },
      relations: ['visitor'],
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Get applications by status
   */
  static async getApplicationsByStatus(
    jobApplicationRepo: Repository<JobApplication>,
    status: ApplicationStatus,
  ): Promise<JobApplication[]> {
    return jobApplicationRepo.find({
      where: { status },
      relations: ['visitor', 'job', 'job.company'],
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Get applications by company
   */
  static async getApplicationsByCompany(
    jobApplicationRepo: Repository<JobApplication>,
    companyId: string,
  ): Promise<JobApplication[]> {
    return jobApplicationRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.visitor', 'visitor')
      .leftJoinAndSelect('application.job', 'job')
      .where('job.companyId = :companyId', { companyId })
      .orderBy('application.appliedAt', 'DESC')
      .getMany();
  }

  /**
   * Count applications by status for a job
   */
  static async countApplicationsByStatusForJob(
    jobApplicationRepo: Repository<JobApplication>,
    jobId: string,
  ): Promise<Record<ApplicationStatus, number>> {
    const counts = await jobApplicationRepo
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('application.jobId = :jobId', { jobId })
      .groupBy('application.status')
      .getRawMany();

    const result: Record<ApplicationStatus, number> = {
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.REVIEWING]: 0,
      [ApplicationStatus.SHORTLISTED]: 0,
      [ApplicationStatus.ACCEPTED]: 0,
      [ApplicationStatus.REJECTED]: 0,
    };

    counts.forEach((count) => {
      result[count.status as ApplicationStatus] = parseInt(count.count, 10);
    });

    return result;
  }

  /**
   * Get application statistics
   */
  static async getApplicationStatistics(
    jobApplicationRepo: Repository<JobApplication>,
    companyId?: string,
  ): Promise<{
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  }> {
    const queryBuilder = jobApplicationRepo.createQueryBuilder('application');

    if (companyId) {
      queryBuilder
        .leftJoin('application.job', 'job')
        .where('job.companyId = :companyId', { companyId });
    }

    const total = await queryBuilder.getCount();

    const statusCounts = await queryBuilder
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('application.status')
      .getRawMany();

    const counts = {
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.REVIEWING]: 0,
      [ApplicationStatus.SHORTLISTED]: 0,
      [ApplicationStatus.ACCEPTED]: 0,
      [ApplicationStatus.REJECTED]: 0,
    };

    statusCounts.forEach((count) => {
      counts[count.status as ApplicationStatus] = parseInt(count.count, 10);
    });

    const acceptanceRate =
      total > 0 ? (counts[ApplicationStatus.ACCEPTED] / total) * 100 : 0;

    return {
      total,
      pending: counts[ApplicationStatus.PENDING],
      reviewing: counts[ApplicationStatus.REVIEWING],
      shortlisted: counts[ApplicationStatus.SHORTLISTED],
      accepted: counts[ApplicationStatus.ACCEPTED],
      rejected: counts[ApplicationStatus.REJECTED],
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    };
  }

  /**
   * Bulk update application statuses
   */
  static async bulkUpdateApplications(
    jobApplicationRepo: Repository<JobApplication>,
    applicationIds: string[],
    status: ApplicationStatus,
  ): Promise<JobApplication[]> {
    const applications = await jobApplicationRepo.findByIds(applicationIds);

    if (applications.length !== applicationIds.length) {
      throw new NotFoundException('Some applications were not found');
    }

    // Validate all status transitions
    applications.forEach((application) => {
      this.validateStatusTransition(application.status, status);
    });

    // Update all applications
    applications.forEach((application) => {
      application.status = status;
    });

    return jobApplicationRepo.save(applications);
  }

  /**
   * Check if visitor has applied for job
   */
  static async hasVisitorAppliedForJob(
    jobApplicationRepo: Repository<JobApplication>,
    visitorId: string,
    jobId: string,
  ): Promise<boolean> {
    const application = await jobApplicationRepo.findOne({
      where: { visitorId, jobId },
    });
    return !!application;
  }

  /**
   * Get recent applications for a company
   */
  static async getRecentApplicationsForCompany(
    jobApplicationRepo: Repository<JobApplication>,
    companyId: string,
    limit: number = 10,
  ): Promise<JobApplication[]> {
    return jobApplicationRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.visitor', 'visitor')
      .leftJoinAndSelect('application.job', 'job')
      .where('job.companyId = :companyId', { companyId })
      .orderBy('application.appliedAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
