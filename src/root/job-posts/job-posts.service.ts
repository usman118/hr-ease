import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { JobPost } from '@/entities/job-post.entity';
import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/user.enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(CompanyHr)
    private companyHrRepository: Repository<CompanyHr>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async getUserCompanyId(userId: string): Promise<string> {
    // First, get the user to determine their role
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If user is a company owner, find their company
    if (user.role === UserRole.COMPANY_OWNER) {
      const company = await this.companyRepository.findOne({
        where: { ownerId: userId },
      });

      if (!company) {
        throw new BadRequestException(
          'Company Owner is not associated with any company',
        );
      }

      return company.id;
    }

    // If user is HR or Admin, find their company through CompanyHr
    if (user.role === UserRole.HR || user.role === UserRole.ADMIN) {
      const companyHr = await this.companyHrRepository.findOne({
        where: { hrId: userId },
      });

      if (!companyHr) {
        throw new BadRequestException(
          'HR user is not associated with any company',
        );
      }

      return companyHr.companyId;
    }

    throw new BadRequestException(
      'User role is not authorized to manage job posts',
    );
  }

  async create(
    createJobPostDto: CreateJobPostDto,
    userId: string,
  ): Promise<JobPost> {
    // Get user's company ID (supports both HR users and Company Owners)
    const companyId = await this.getUserCompanyId(userId);

    const jobPost = this.jobPostRepository.create({
      ...createJobPostDto,
      companyId,
      createdBy: userId,
      isActive: true,
    });

    return this.jobPostRepository.save(jobPost);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    jobPosts: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.jobPostRepository
      .createQueryBuilder('jobPost')
      .where('jobPost.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('jobPost.company', 'company')
      .leftJoinAndSelect('jobPost.createdByUser', 'createdByUser');

    if (search) {
      queryBuilder.andWhere(
        '(jobPost.title ILIKE :search OR jobPost.description ILIKE :search OR jobPost.location ILIKE :search OR company.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const jobPosts = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('jobPost.createdAt', 'DESC')
      .getMany();

    return {
      jobPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUserJobPosts(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    jobPosts: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Get user's company ID to show all company job posts
    const companyId = await this.getUserCompanyId(userId);

    const queryBuilder = this.jobPostRepository
      .createQueryBuilder('jobPost')
      .where('jobPost.companyId = :companyId', { companyId })
      .leftJoinAndSelect('jobPost.company', 'company')
      .leftJoinAndSelect('jobPost.createdByUser', 'createdByUser');

    if (search) {
      queryBuilder.andWhere(
        '(jobPost.title ILIKE :search OR jobPost.description ILIKE :search OR jobPost.location ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const jobPosts = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('jobPost.createdAt', 'DESC')
      .getMany();

    return {
      jobPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<JobPost> {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id },
      relations: ['company', 'createdByUser'],
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    return jobPost;
  }

  async update(
    id: string,
    updateJobPostDto: UpdateJobPostDto,
    userId: string,
  ): Promise<JobPost> {
    const jobPost = await this.findOne(id);

    // Verify user has access to this job post
    const userCompanyId = await this.getUserCompanyId(userId);
    if (jobPost.companyId !== userCompanyId) {
      throw new BadRequestException(
        'You can only update job posts from your company',
      );
    }

    Object.assign(jobPost, updateJobPostDto);
    return this.jobPostRepository.save(jobPost);
  }

  async remove(id: string, userId: string): Promise<void> {
    const jobPost = await this.findOne(id);

    // Verify user has access to this job post
    const userCompanyId = await this.getUserCompanyId(userId);
    if (jobPost.companyId !== userCompanyId) {
      throw new BadRequestException(
        'You can only delete job posts from your company',
      );
    }

    await this.jobPostRepository.softRemove(jobPost);
  }

  async toggleStatus(id: string, userId: string): Promise<JobPost> {
    const jobPost = await this.findOne(id);

    // Verify user has access to this job post
    const userCompanyId = await this.getUserCompanyId(userId);
    if (jobPost.companyId !== userCompanyId) {
      throw new BadRequestException(
        'You can only toggle job posts from your company',
      );
    }

    jobPost.isActive = !jobPost.isActive;
    return this.jobPostRepository.save(jobPost);
  }

  async getStatistics(userId: string): Promise<{
    totalJobPosts: number;
    activeJobPosts: number;
    inactiveJobPosts: number;
    jobPostsCreatedThisMonth: number;
    jobPostsByType: { type: string; count: number }[];
    jobPostsByLevel: { level: string; count: number }[];
  }> {
    const companyId = await this.getUserCompanyId(userId);

    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    const [
      totalJobPosts,
      activeJobPosts,
      jobPostsCreatedThisMonth,
      jobPostsByType,
      jobPostsByLevel,
    ] = await Promise.all([
      this.jobPostRepository.count({ where: { companyId } }),
      this.jobPostRepository.count({ where: { companyId, isActive: true } }),
      this.jobPostRepository.count({
        where: {
          companyId,
          createdAt: MoreThanOrEqual(firstDayOfMonth),
        },
      }),
      this.jobPostRepository
        .createQueryBuilder('jobPost')
        .select('jobPost.jobType as type, COUNT(*) as count')
        .where('jobPost.companyId = :companyId', { companyId })
        .groupBy('jobPost.jobType')
        .getRawMany(),
      this.jobPostRepository
        .createQueryBuilder('jobPost')
        .select('jobPost.jobLevel as level, COUNT(*) as count')
        .where('jobPost.companyId = :companyId', { companyId })
        .groupBy('jobPost.jobLevel')
        .getRawMany(),
    ]);

    const inactiveJobPosts = totalJobPosts - activeJobPosts;

    return {
      totalJobPosts,
      activeJobPosts,
      inactiveJobPosts,
      jobPostsCreatedThisMonth,
      jobPostsByType: jobPostsByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
      jobPostsByLevel: jobPostsByLevel.map((item) => ({
        level: item.level,
        count: parseInt(item.count),
      })),
    };
  }
}
