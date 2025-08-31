import { JobApplication } from '@/entities/job-application.entity';
import { JobPost } from '@/entities/job-post.entity';
import { Visitor } from '@/entities/visitor.entity';
import { JobApplicationHelper } from '@/helpers/job-application.helper';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private jobApplicationRepository: Repository<JobApplication>,
    @InjectRepository(JobPost)
    private jobPostRepository: Repository<JobPost>,
    @InjectRepository(Visitor)
    private visitorRepository: Repository<Visitor>,
  ) {}

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return JobApplicationHelper.createJobApplication(
      this.jobApplicationRepository,
      this.jobPostRepository,
      this.visitorRepository,
      createJobApplicationDto.visitorId,
      createJobApplicationDto.jobPostId,
    );
  }

  async findAll(): Promise<JobApplication[]> {
    return this.jobApplicationRepository.find({
      relations: ['job', 'visitor'],
    });
  }

  async findOne(id: string): Promise<JobApplication> {
    return JobApplicationHelper.findApplicationById(
      this.jobApplicationRepository,
      id,
      ['job', 'visitor'],
    );
  }

  async update(
    id: string,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    // For status updates, use the helper
    if (
      updateJobApplicationDto.status &&
      Object.keys(updateJobApplicationDto).length === 1
    ) {
      return JobApplicationHelper.updateApplicationStatus(
        this.jobApplicationRepository,
        id,
        updateJobApplicationDto.status,
      );
    }

    // For other updates, use traditional approach for now
    const jobApplication = await this.findOne(id);

    // Verify job post exists if being updated
    if (updateJobApplicationDto.jobPostId) {
      const jobPost = await this.jobPostRepository.findOne({
        where: { id: updateJobApplicationDto.jobPostId },
      });
      if (!jobPost) {
        throw new NotFoundException('Job post not found');
      }
    }

    // Verify visitor exists if being updated
    if (updateJobApplicationDto.visitorId) {
      const visitor = await this.visitorRepository.findOne({
        where: { id: updateJobApplicationDto.visitorId },
      });
      if (!visitor) {
        throw new NotFoundException('Visitor not found');
      }
    }

    Object.assign(jobApplication, updateJobApplicationDto);
    return this.jobApplicationRepository.save(jobApplication);
  }

  async remove(id: string): Promise<void> {
    const jobApplication = await this.findOne(id);
    await this.jobApplicationRepository.softRemove(jobApplication);
  }
}
