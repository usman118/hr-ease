import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyHr } from '../../entities/company-hr.entity';
import { Company } from '../../entities/company.entity';
import { JobPost } from '../../entities/job-post.entity';
import { User } from '../../entities/user.entity';
import { JobLevel, JobType } from '../../enums/job.enum';
import { JobPostsService } from './job-posts.service';

describe('JobPostsService', () => {
  let service: JobPostsService;
  let jobPostRepository: jest.Mocked<Repository<JobPost>>;
  let _companyRepository: jest.Mocked<Repository<Company>>;
  let companyHrRepository: jest.Mocked<Repository<CompanyHr>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 'user-id',
    email: 'hr@company.com',
    role: 'hr',
    companyId: 'company-id',
  };

  const mockJobPost = {
    id: 'job-id',
    title: 'Software Engineer',
    description: 'Great opportunity for a software engineer',
    requirements: '3+ years experience',
    jobType: JobType.FULL_TIME,
    jobLevel: JobLevel.MID,
    location: 'San Francisco, CA',
    salary: 100000,
    companyId: 'company-id',
    createdBy: 'user-id',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostsService,
        {
          provide: getRepositoryToken(JobPost),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            softRemove: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
              getOne: jest.fn(),
              getCount: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompanyHr),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobPostsService>(JobPostsService);
    jobPostRepository = module.get(getRepositoryToken(JobPost));
    _companyRepository = module.get(getRepositoryToken(Company));
    companyHrRepository = module.get(getRepositoryToken(CompanyHr));
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job post successfully', async () => {
      const createJobPostDto = {
        title: 'Software Engineer',
        description: 'Great opportunity',
        requirements: '3+ years experience',
        jobType: JobType.FULL_TIME,
        jobLevel: JobLevel.MID,
        location: 'San Francisco, CA',
        salary: 100000,
      };

      const createdJob = { ...mockJobPost, ...createJobPostDto };

      // Mock the getUserCompanyId method dependencies
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: 'company-id',
      } as any);

      jobPostRepository.create.mockReturnValue(createdJob as any);
      jobPostRepository.save.mockResolvedValue(createdJob as any);

      const result = await service.create(createJobPostDto, mockUser.id);

      expect(jobPostRepository.create).toHaveBeenCalledWith({
        ...createJobPostDto,
        companyId: 'company-id',
        createdBy: mockUser.id,
        isActive: true,
      });
      expect(jobPostRepository.save).toHaveBeenCalledWith(createdJob);
      expect(result).toEqual(createdJob);
    });
  });

  describe('findAll', () => {
    it('should return all active job posts for public access', async () => {
      const activeJobs = [mockJobPost];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(activeJobs),
        getCount: jest.fn().mockResolvedValue(1),
      };

      jobPostRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findAll(1, 10);

      expect(jobPostRepository.createQueryBuilder).toHaveBeenCalledWith(
        'jobPost',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'jobPost.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'jobPost.company',
        'company',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'jobPost.createdByUser',
        'createdByUser',
      );
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'jobPost.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();

      expect(result).toEqual({
        jobPosts: activeJobs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should return company-specific jobs for authenticated users', async () => {
      const companyJobs = [mockJobPost];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(companyJobs),
        getCount: jest.fn().mockResolvedValue(1),
      };

      // Mock dependencies for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: 'company-id',
      } as any);

      jobPostRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findUserJobPosts(mockUser.id, 1, 10);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'jobPost.companyId = :companyId',
        { companyId: 'company-id' },
      );
      expect(result).toEqual({
        jobPosts: companyJobs,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a job post by ID', async () => {
      jobPostRepository.findOne.mockResolvedValue(mockJobPost as any);

      const result = await service.findOne('job-id');

      expect(jobPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        relations: ['company', 'createdByUser'],
      });
      expect(result).toEqual(mockJobPost);
    });

    it('should throw NotFoundException for non-existent job', async () => {
      jobPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a job post successfully', async () => {
      const updateJobPostDto = {
        title: 'Senior Software Engineer',
        salary: 120000,
      };

      const updatedJob = { ...mockJobPost, ...updateJobPostDto };

      // Mock findOne to return the job post
      jobPostRepository.findOne.mockResolvedValue(mockJobPost as any);

      // Mock dependencies for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: 'company-id',
      } as any);

      jobPostRepository.save.mockResolvedValue(updatedJob as any);

      const result = await service.update(
        'job-id',
        updateJobPostDto,
        mockUser.id,
      );

      expect(jobPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        relations: ['company', 'createdByUser'],
      });
      expect(jobPostRepository.save).toHaveBeenCalledWith(updatedJob);
      expect(result).toEqual(updatedJob);
    });

    it('should throw NotFoundException for non-existent job', async () => {
      const updateJobPostDto = { title: 'Updated Title' };

      // Mock findOne to return null
      jobPostRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateJobPostDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a job post successfully', async () => {
      // Mock findOne to return the job post
      jobPostRepository.findOne.mockResolvedValue(mockJobPost as any);

      // Mock dependencies for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: 'company-id',
      } as any);

      jobPostRepository.softRemove.mockResolvedValue(mockJobPost as any);

      await service.remove('job-id', mockUser.id);

      expect(jobPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-id' },
        relations: ['company', 'createdByUser'],
      });
      expect(jobPostRepository.softRemove).toHaveBeenCalledWith(mockJobPost);
    });

    it('should throw NotFoundException for non-existent job', async () => {
      // Mock findOne to return null
      jobPostRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
