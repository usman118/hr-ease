import { CompanyHr } from '@/entities/company-hr.entity';
import { Company } from '@/entities/company.entity';
import { JobPost } from '@/entities/job-post.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(createJobPostDto: CreateJobPostDto): Promise<JobPost> {
    // Verify company exists
    const company = await this.companyRepository.findOne({
      where: { id: createJobPostDto.companyId },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Verify company HR exists if provided
    if (createJobPostDto.companyHrId) {
      const companyHr = await this.companyHrRepository.findOne({
        where: { id: createJobPostDto.companyHrId },
      });
      if (!companyHr) {
        throw new NotFoundException('Company HR not found');
      }
    }

    const jobPost = this.jobPostRepository.create(createJobPostDto);
    return this.jobPostRepository.save(jobPost);
  }

  async findAll(): Promise<JobPost[]> {
    return this.jobPostRepository.find({
      relations: ['company', 'companyHr'],
    });
  }

  async findOne(id: string): Promise<JobPost> {
    const jobPost = await this.jobPostRepository.findOne({
      where: { id },
      relations: ['company', 'companyHr'],
    });

    if (!jobPost) {
      throw new NotFoundException('Job post not found');
    }

    return jobPost;
  }

  async update(
    id: string,
    updateJobPostDto: UpdateJobPostDto,
  ): Promise<JobPost> {
    const jobPost = await this.findOne(id);

    // Verify company exists if being updated
    if (updateJobPostDto.companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: updateJobPostDto.companyId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    // Verify company HR exists if being updated
    if (updateJobPostDto.companyHrId) {
      const companyHr = await this.companyHrRepository.findOne({
        where: { id: updateJobPostDto.companyHrId },
      });
      if (!companyHr) {
        throw new NotFoundException('Company HR not found');
      }
    }

    Object.assign(jobPost, updateJobPostDto);
    return this.jobPostRepository.save(jobPost);
  }

  async remove(id: string): Promise<void> {
    const jobPost = await this.findOne(id);
    await this.jobPostRepository.softRemove(jobPost);
  }
}
