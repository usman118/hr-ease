import { Company } from '@/entities/company.entity';
import { JobPost } from '@/entities/job-post.entity';
import { User } from '@/entities/user.entity';
import { JobType } from '@/enums/job.enum';
import { UserRole } from '@/enums/user.enum';
import { CreateJobPostDto } from '@/root/job-posts/dto/create-job-post.dto';
import { UpdateJobPostDto } from '@/root/job-posts/dto/update-job-post.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class JobPostHelper {
  /**
   * Find job post by ID with proper error handling
   */
  static async findJobPostById(
    jobPostRepo: Repository<JobPost>,
    id: string,
  ): Promise<JobPost> {
    const jobPost = await jobPostRepo.findOne({
      where: { id },
      relations: ['company', 'createdByUser'],
    });

    if (!jobPost) {
      throw new NotFoundException(`Job post with ID ${id} not found`);
    }
    return jobPost;
  }

  /**
   * Validate company exists
   */
  static async validateCompany(
    companyRepo: Repository<Company>,
    companyId: string,
  ): Promise<Company> {
    const company = await companyRepo.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  /**
   * Validate HR user
   */
  static async validateHRUser(
    userRepo: Repository<User>,
    hrId: string,
  ): Promise<User> {
    const hr = await userRepo.findOne({
      where: { id: hrId },
    });

    if (!hr) {
      throw new NotFoundException('HR user not found');
    }

    if (hr.role !== UserRole.HR && hr.role !== UserRole.ADMIN) {
      throw new NotFoundException('User must be HR or Admin to post jobs');
    }

    return hr;
  }

  /**
   * Create job post with validation
   */
  static async createJobPost(
    jobPostRepo: Repository<JobPost>,
    companyRepo: Repository<Company>,
    userRepo: Repository<User>,
    createJobPostDto: CreateJobPostDto,
    companyId: string,
    createdBy: string,
  ): Promise<JobPost> {
    // Validate company exists
    await this.validateCompany(companyRepo, companyId);

    // Validate user
    await this.validateHRUser(userRepo, createdBy);

    const jobPost = jobPostRepo.create({
      ...createJobPostDto,
      companyId,
      createdBy,
      isActive: true,
    });
    return jobPostRepo.save(jobPost);
  }

  /**
   * Update job post with validation
   */
  static async updateJobPost(
    jobPostRepo: Repository<JobPost>,
    companyRepo: Repository<Company>,
    userRepo: Repository<User>,
    id: string,
    updateJobPostDto: UpdateJobPostDto,
    companyId?: string,
    userId?: string,
  ): Promise<JobPost> {
    const jobPost = await this.findJobPostById(jobPostRepo, id);

    // Validate company if being updated
    if (companyId) {
      await this.validateCompany(companyRepo, companyId);
    }

    // Validate user if being updated
    if (userId) {
      await this.validateHRUser(userRepo, userId);
    }

    Object.assign(jobPost, updateJobPostDto);
    return jobPostRepo.save(jobPost);
  }

  /**
   * Soft delete job post
   */
  static async softDeleteJobPost(
    jobPostRepo: Repository<JobPost>,
    id: string,
  ): Promise<void> {
    const jobPost = await this.findJobPostById(jobPostRepo, id);
    await jobPostRepo.softRemove(jobPost);
  }

  /**
   * Get job posts by company
   */
  static async getJobPostsByCompany(
    jobPostRepo: Repository<JobPost>,
    companyId: string,
  ): Promise<JobPost[]> {
    return jobPostRepo.find({
      where: { companyId },
      relations: ['company', 'createdByUser'],
    });
  }

  /**
   * Get job posts by user
   */
  static async getJobPostsByUser(
    jobPostRepo: Repository<JobPost>,
    userId: string,
  ): Promise<JobPost[]> {
    return jobPostRepo.find({
      where: { createdBy: userId },
      relations: ['company', 'createdByUser'],
    });
  }

  /**
   * Check if job is remote
   */
  static isRemoteJob(jobPost: JobPost): boolean {
    return jobPost.location?.toLowerCase().includes('remote') || false;
  }

  /**
   * Check if job type is full-time
   */
  static isFullTimeJob(jobPost: JobPost): boolean {
    return jobPost.jobType === JobType.FULL_TIME;
  }

  /**
   * Format job post title
   */
  static getJobPostTitle(jobPost: JobPost): string {
    const remote = this.isRemoteJob(jobPost) ? ' (Remote)' : '';
    return `${jobPost.title}${remote}`;
  }

  /**
   * Get job posts by type
   */
  static async getJobPostsByType(
    jobPostRepo: Repository<JobPost>,
    jobType: JobType,
  ): Promise<JobPost[]> {
    return jobPostRepo.find({
      where: { jobType: jobType },
      relations: ['company'],
    });
  }

  /**
   * Search job posts by keyword
   */
  static async searchJobPosts(
    jobPostRepo: Repository<JobPost>,
    keyword: string,
  ): Promise<JobPost[]> {
    return jobPostRepo
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('job.title ILIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('job.description ILIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('company.name ILIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }
}
