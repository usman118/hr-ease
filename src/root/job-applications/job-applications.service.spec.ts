import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyHr } from '../../entities/company-hr.entity';
import { Company } from '../../entities/company.entity';
import { JobApplication } from '../../entities/job-application.entity';
import { JobPost } from '../../entities/job-post.entity';
import { User } from '../../entities/user.entity';
import { Visitor } from '../../entities/visitor.entity';
import { ApplicationStatus } from '../../enums/application.enum';
import { JobApplicationsService } from './job-applications.service';

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;
  let jobApplicationRepository: jest.Mocked<Repository<JobApplication>>;
  let visitorRepository: jest.Mocked<Repository<Visitor>>;
  let jobPostRepository: jest.Mocked<Repository<JobPost>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let companyRepository: jest.Mocked<Repository<Company>>;
  let companyHrRepository: jest.Mocked<Repository<CompanyHr>>;

  const mockUser = {
    id: 'hr-user-id',
    email: 'hr@company.com',
    role: 'hr',
    companyId: 'company-id',
  };

  const mockJobPost = {
    id: 'job-id',
    title: 'Software Engineer',
    description: 'Great job opportunity',
    companyId: 'company-id',
    isActive: true,
    createdBy: 'hr-user-id',
  };

  const mockVisitor = {
    id: 'visitor-id',
    email: 'applicant@example.com',
    firstName: 'John',
    lastName: 'Doe',
    telephone: '+1234567890',
    documentUrl: 'https://example.com/resume.pdf',
  };

  const mockJobApplication = {
    id: 'application-id',
    jobId: 'job-id',
    visitorId: 'visitor-id',
    coverLetter: 'I am interested in this position',
    status: ApplicationStatus.PENDING,
    appliedAt: new Date(),
    job: mockJobPost,
    visitor: mockVisitor,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        {
          provide: getRepositoryToken(JobApplication),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Visitor),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(JobPost),
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
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
    jobApplicationRepository = module.get(getRepositoryToken(JobApplication));
    visitorRepository = module.get(getRepositoryToken(Visitor));
    jobPostRepository = module.get(getRepositoryToken(JobPost));
    userRepository = module.get(getRepositoryToken(User));
    companyRepository = module.get(getRepositoryToken(Company));
    companyHrRepository = module.get(getRepositoryToken(CompanyHr));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyForJob', () => {
    it('should create job application successfully', async () => {
      const jobId = 'job-id';
      const applyDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        telephone: '+1234567890',
        documentUrl: 'https://example.com/resume.pdf',
        coverLetter: 'I am interested in this position',
        expectedSalary: 75000,
      };

      const newVisitor = { ...mockVisitor, ...applyDto };
      const newApplication = {
        ...mockJobApplication,
        id: 'new-application-id', // Ensure the application has an ID
      };

      jobPostRepository.findOne.mockResolvedValue(mockJobPost as any);

      // Mock the complete application retrieval
      jobApplicationRepository.findOne.mockResolvedValue({
        ...newApplication,
        job: mockJobPost,
        visitor: newVisitor,
      } as any);

      visitorRepository.create.mockReturnValue(newVisitor as any);
      visitorRepository.save.mockResolvedValue(newVisitor as any);

      jobApplicationRepository.create.mockReturnValue(newApplication as any);
      jobApplicationRepository.save.mockResolvedValue(newApplication as any);

      const result = await service.applyForJob(jobId, applyDto);

      expect(jobPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId, isActive: true },
        relations: ['company'],
      });
      expect(visitorRepository.create).toHaveBeenCalledWith({
        firstName: applyDto.firstName,
        lastName: applyDto.lastName,
        email: applyDto.email,
        telephone: applyDto.telephone,
        address: undefined,
        yearsOfExperience: undefined,
        currentPosition: undefined,
        linkedinUrl: undefined,
        portfolioUrl: undefined,
        documentUrl: applyDto.documentUrl,
      });
      expect(visitorRepository.save).toHaveBeenCalledWith(newVisitor);
      expect(jobApplicationRepository.create).toHaveBeenCalledWith({
        jobId,
        visitorId: newVisitor.id,
        coverLetter: applyDto.coverLetter,
        expectedSalary: applyDto.expectedSalary,
      });
      expect(result).toEqual({
        message: 'Application submitted successfully',
        application: expect.objectContaining({
          job: mockJobPost,
          visitor: newVisitor,
        }),
      });
    });

    it('should throw NotFoundException for inactive job', async () => {
      const jobId = 'inactive-job-id';
      const applyDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        telephone: '+1234567890',
        documentUrl: 'https://example.com/resume.pdf',
        coverLetter: 'I am interested in this position',
        expectedSalary: 75000,
      };

      jobPostRepository.findOne.mockResolvedValue(null);

      await expect(service.applyForJob(jobId, applyDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getApplicationsForJob', () => {
    it('should return applications for HR user', async () => {
      const jobId = 'job-id';
      const applications = [mockJobApplication];

      // Mock user repository for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: mockUser.companyId,
      } as any);

      jobPostRepository.findOne.mockResolvedValue({
        id: jobId,
        companyId: mockUser.companyId,
      } as any);

      jobApplicationRepository.find.mockResolvedValue(applications as any);

      const result = await service.getApplicationsForJob(jobId, mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(companyHrRepository.findOne).toHaveBeenCalledWith({
        where: { hrId: mockUser.id },
      });
      expect(jobPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: jobId },
      });
      expect(jobApplicationRepository.find).toHaveBeenCalledWith({
        where: { jobId },
        relations: ['job', 'visitor'],
        order: { appliedAt: 'DESC' },
      });
      expect(result).toEqual(applications);
    });
  });

  describe('getMyJobApplications', () => {
    it('should return all applications for user company', async () => {
      const applications = [mockJobApplication];

      // Mock user repository for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: mockUser.companyId,
      } as any);

      jobApplicationRepository.find.mockResolvedValue(applications as any);

      const result = await service.getMyJobApplications(mockUser.id);

      expect(jobApplicationRepository.find).toHaveBeenCalledWith({
        where: {
          job: {
            companyId: mockUser.companyId,
          },
        },
        relations: ['job', 'visitor'],
        order: { appliedAt: 'DESC' },
      });
      expect(result).toEqual({
        applications,
        total: applications.length,
      });
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status successfully', async () => {
      const applicationId = 'application-id';
      const updateDto = {
        status: ApplicationStatus.SHORTLISTED,
        hrNotes: 'Excellent candidate',
      };

      const updatedApplication = {
        ...mockJobApplication,
        status: updateDto.status,
        hrNotes: updateDto.hrNotes,
        updatedAt: new Date(),
      };

      // Mock the application lookup
      jobApplicationRepository.findOne.mockResolvedValue(
        mockJobApplication as any,
      );

      // Mock user repository for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: mockUser.companyId,
      } as any);

      // Mock job post for verifyJobAccess
      jobPostRepository.findOne.mockResolvedValue({
        id: mockJobApplication.jobId,
        companyId: mockUser.companyId,
      } as any);

      jobApplicationRepository.save.mockResolvedValue(
        updatedApplication as any,
      );

      const result = await service.updateApplicationStatus(
        applicationId,
        updateDto,
        mockUser.id,
      );

      expect(jobApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: applicationId },
        relations: ['job', 'visitor'],
      });
      expect(result).toEqual(updatedApplication);
    });

    it('should throw NotFoundException for non-existent application', async () => {
      const applicationId = 'non-existent-id';
      const updateDto = {
        status: ApplicationStatus.SHORTLISTED,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jobApplicationRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await expect(
        service.updateApplicationStatus(
          applicationId,
          updateDto,
          mockUser as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different company', async () => {
      const applicationId = 'application-id';
      const updateDto = {
        status: ApplicationStatus.SHORTLISTED,
      };

      const differentCompanyApplication = {
        ...mockJobApplication,
        job: { ...mockJobPost, companyId: 'different-company-id' },
      };

      // Mock the application lookup
      jobApplicationRepository.findOne.mockResolvedValue(
        differentCompanyApplication as any,
      );

      // Mock user repository for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: mockUser.companyId,
      } as any);

      // Mock job post for verifyJobAccess - different company
      jobPostRepository.findOne.mockResolvedValue({
        id: mockJobApplication.jobId,
        companyId: 'different-company-id',
      } as any);

      await expect(
        service.updateApplicationStatus(applicationId, updateDto, mockUser.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getApplicationById', () => {
    it('should return application by ID for authorized user', async () => {
      const applicationId = 'application-id';

      // Mock the application lookup
      jobApplicationRepository.findOne.mockResolvedValue(
        mockJobApplication as any,
      );

      // Mock user repository for getUserCompanyId (verifyJobAccess)
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: mockUser.companyId,
      } as any);

      // Mock job post for verifyJobAccess
      jobPostRepository.findOne.mockResolvedValue({
        id: mockJobApplication.jobId,
        companyId: mockUser.companyId,
      } as any);

      const result = await service.getApplicationById(
        applicationId,
        mockUser.id,
      );

      expect(jobApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: applicationId },
        relations: ['job', 'visitor'],
      });
      expect(result).toEqual(mockJobApplication);
    });

    it('should throw NotFoundException for non-existent application', async () => {
      const applicationId = 'non-existent-id';

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jobApplicationRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await expect(
        service.getApplicationById(applicationId, mockUser as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getApplicationStatistics', () => {
    it('should return application statistics', async () => {
      const applications = [
        {
          ...mockJobApplication,
          status: 'pending',
          job: { ...mockJobPost, title: 'Software Engineer' },
        },
        {
          ...mockJobApplication,
          status: 'pending',
          job: { ...mockJobPost, title: 'Software Engineer' },
        },
        {
          ...mockJobApplication,
          status: 'pending',
          job: { ...mockJobPost, title: 'Software Engineer' },
        },
        {
          ...mockJobApplication,
          status: 'pending',
          job: { ...mockJobPost, title: 'Product Manager' },
        },
        {
          ...mockJobApplication,
          status: 'pending',
          job: { ...mockJobPost, title: 'Product Manager' },
        },
        {
          ...mockJobApplication,
          status: 'shortlisted',
          job: { ...mockJobPost, title: 'Software Engineer' },
        },
        {
          ...mockJobApplication,
          status: 'shortlisted',
          job: { ...mockJobPost, title: 'Product Manager' },
        },
        {
          ...mockJobApplication,
          status: 'rejected',
          job: { ...mockJobPost, title: 'Software Engineer' },
        },
      ];

      const mockJobStats = [
        { jobTitle: 'Software Engineer', count: '3' },
        { jobTitle: 'Product Manager', count: '2' },
      ];

      // Mock user repository for getUserCompanyId
      userRepository.findOne.mockResolvedValue({
        id: mockUser.id,
        role: 'hr',
      } as any);

      companyHrRepository.findOne.mockResolvedValue({
        companyId: mockUser.companyId,
      } as any);

      // Mock the find method for getting applications
      jobApplicationRepository.find.mockResolvedValue(applications as any);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockJobStats),
      };

      jobApplicationRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getApplicationStatistics(mockUser.id);

      expect(result).toEqual({
        totalApplications: 8,
        pendingApplications: 5,
        reviewingApplications: 0,
        shortlistedApplications: 2,
        rejectedApplications: 1,
        acceptedApplications: 0,
        applicationsByJob: [
          { jobTitle: 'Software Engineer', count: 5 },
          { jobTitle: 'Product Manager', count: 3 },
        ],
      });
    });
  });
});
