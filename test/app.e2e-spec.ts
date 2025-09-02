import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('HR Ease E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Store tokens and IDs for cross-test usage
  let adminToken: string;
  let hrToken: string;
  let companyOwnerToken: string;
  let companyId: string;
  let jobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('/auth/signup (POST) - Create Admin', async () => {
      const signupDto = {
        email: 'admin@hrease.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(signupDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(signupDto.email);
      expect(response.body.user.role).toBe('admin');

      adminToken = response.body.access_token;
    });

    it('/auth/login (POST) - Admin Login', async () => {
      const loginDto = {
        email: 'admin@hrease.com',
        password: 'Admin123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      adminToken = response.body.access_token;
    });
  });

  describe('Company Management Flow', () => {
    it('/companies (POST) - Create Company as Admin', async () => {
      const createCompanyDto = {
        name: 'TechCorp Solutions E2E',
        description: 'A leading technology company',
        industry: 'Technology',
        website: 'https://techcorp-e2e.com',
        address: '123 Tech Street, Silicon Valley, CA',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createCompanyDto)
        .expect(201);

      expect(response.body.name).toBe(createCompanyDto.name);
      expect(response.body).toHaveProperty('id');

      companyId = response.body.id;
    });

    it('/admin/create-company-owner (POST) - Create Company Owner', async () => {
      const createOwnerDto = {
        email: 'owner@techcorp-e2e.com',
        password: 'Owner123!',
        firstName: 'Company',
        lastName: 'Owner',
        companyId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/create-company-owner')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createOwnerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(createOwnerDto.email);
      expect(response.body.user.role).toBe('company_owner');

      companyOwnerToken = response.body.access_token;
    });

    it('/auth/login (POST) - Company Owner Login', async () => {
      const loginDto = {
        email: 'owner@techcorp-e2e.com',
        password: 'Owner123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      companyOwnerToken = response.body.access_token;
    });

    it('/users/create-hr (POST) - Create HR User', async () => {
      const createHRDto = {
        email: 'hr@techcorp-e2e.com',
        password: 'HR123!',
        firstName: 'HR',
        lastName: 'Manager',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users/create-hr')
        .set('Authorization', `Bearer ${companyOwnerToken}`)
        .send(createHRDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(createHRDto.email);
      expect(response.body.user.role).toBe('hr');

      hrToken = response.body.access_token;
    });
  });

  describe('Job Management Flow', () => {
    it('/job-posts (POST) - Create Job Post as HR', async () => {
      const createJobDto = {
        title: 'Senior Software Engineer E2E',
        description:
          'We are looking for a senior software engineer for our E2E test.',
        requirements: '5+ years of experience in TypeScript, React, Node.js',
        jobType: 'full-time',
        jobLevel: 'senior',
        location: 'San Francisco, CA',
        salary: 120000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/job-posts')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(createJobDto)
        .expect(201);

      expect(response.body.title).toBe(createJobDto.title);
      expect(response.body).toHaveProperty('id');
      expect(response.body.isActive).toBe(true);

      jobId = response.body.id;
    });

    it('/job-posts (GET) - Get All Job Posts (Public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/job-posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const job = response.body.find((j: any) => j.id === jobId);
      expect(job).toBeDefined();
      expect(job.title).toBe('Senior Software Engineer E2E');
    });

    it('/job-posts/:id (GET) - Get Job Post by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/job-posts/${jobId}`)
        .expect(200);

      expect(response.body.id).toBe(jobId);
      expect(response.body.title).toBe('Senior Software Engineer E2E');
    });
  });

  describe('Job Application Flow', () => {
    let applicationId: string;

    it('/job-applications/apply/:jobId (POST) - Apply for Job', async () => {
      const applyDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        telephone: '+1234567890',
        documentUrl: 'https://example.com/jane-smith-resume.pdf',
        address: '456 Main Street, San Francisco, CA',
        yearsOfExperience: 5,
        currentPosition: 'Software Developer',
        linkedinUrl: 'https://linkedin.com/in/jane-smith',
        portfolioUrl: 'https://jane-portfolio.com',
        coverLetter:
          'I am very interested in this position and believe my skills align perfectly.',
        notes: 'Available for interviews immediately',
        expectedSalary: 125000,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/job-applications/apply/${jobId}`)
        .send(applyDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.visitor.email).toBe(applyDto.email);
      expect(response.body.visitor.firstName).toBe(applyDto.firstName);
      expect(response.body.coverLetter).toBe(applyDto.coverLetter);
      expect(response.body.status).toBe('pending');
      expect(response.body.job.id).toBe(jobId);

      applicationId = response.body.id;
    });

    it('/job-applications/apply/:jobId (POST) - Apply for Same Job with Same Email (Should Create New Record)', async () => {
      const applyDto = {
        firstName: 'Jane',
        lastName: 'Smith Updated',
        email: 'jane.smith@example.com', // Same email
        telephone: '+1234567891', // Different phone
        documentUrl: 'https://example.com/jane-smith-updated-resume.pdf',
        address: '789 Updated Street, San Francisco, CA',
        yearsOfExperience: 6, // Updated experience
        currentPosition: 'Senior Software Developer',
        linkedinUrl: 'https://linkedin.com/in/jane-smith-updated',
        portfolioUrl: 'https://jane-portfolio-updated.com',
        coverLetter: 'Updated cover letter with more details.',
        notes: 'Updated availability',
        expectedSalary: 130000,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/job-applications/apply/${jobId}`)
        .send(applyDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).not.toBe(applicationId); // Should be different application
      expect(response.body.visitor.email).toBe(applyDto.email);
      expect(response.body.visitor.lastName).toBe('Smith Updated');
      expect(response.body.visitor.yearsOfExperience).toBe(6);
    });

    it('/job-applications/my-applications (GET) - HR Views Applications', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/job-applications/my-applications')
        .set('Authorization', `Bearer ${hrToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('applications');
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBe(2); // Two applications from same email
      expect(Array.isArray(response.body.applications)).toBe(true);

      const application = response.body.applications.find(
        (app: any) => app.id === applicationId,
      );
      expect(application).toBeDefined();
      expect(application.visitor.email).toBe('jane.smith@example.com');
    });

    it('/job-applications/:id/status (PUT) - Update Application Status', async () => {
      const updateDto = {
        status: 'shortlisted',
        hrNotes:
          'Excellent candidate with strong experience in our tech stack.',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/job-applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.status).toBe('shortlisted');
      expect(response.body.hrNotes).toBe(updateDto.hrNotes);
      expect(response.body.updatedAt).toBeDefined();
    });

    it('/job-applications/:id (GET) - Get Application by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/job-applications/${applicationId}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .expect(200);

      expect(response.body.id).toBe(applicationId);
      expect(response.body.status).toBe('shortlisted');
      expect(response.body.hrNotes).toBe(
        'Excellent candidate with strong experience in our tech stack.',
      );
      expect(response.body).toHaveProperty('visitor');
      expect(response.body).toHaveProperty('job');
    });

    it('/job-applications/statistics (GET) - Get Application Statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/job-applications/statistics')
        .set('Authorization', `Bearer ${hrToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalApplications');
      expect(response.body).toHaveProperty('pendingApplications');
      expect(response.body).toHaveProperty('shortlistedApplications');
      expect(response.body).toHaveProperty('applicationsByJob');
      expect(response.body.totalApplications).toBe(2);
      expect(response.body.shortlistedApplications).toBe(1);
      expect(response.body.pendingApplications).toBe(1);
      expect(Array.isArray(response.body.applicationsByJob)).toBe(true);
    });
  });

  describe('Authorization Tests', () => {
    it('Should prevent unauthorized access to HR endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/job-applications/my-applications')
        .expect(401);
    });

    it('Should prevent non-admin from creating company owners', async () => {
      const createOwnerDto = {
        email: 'unauthorized@test.com',
        password: 'Test123!',
        firstName: 'Unauthorized',
        lastName: 'User',
        companyId,
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/create-company-owner')
        .set('Authorization', `Bearer ${hrToken}`) // HR token, not admin
        .send(createOwnerDto)
        .expect(403);
    });

    it('Should prevent access to other company data', async () => {
      // This would require setting up another company and testing cross-company access
      // For now, we'll test that applications are filtered by company
      const response = await request(app.getHttpServer())
        .get('/api/v1/job-applications/my-applications')
        .set('Authorization', `Bearer ${hrToken}`)
        .expect(200);

      // All applications should belong to the same company
      response.body.applications.forEach((application: any) => {
        expect(application.job.companyId).toBe(companyId);
      });
    });
  });

  describe('Data Validation Tests', () => {
    it('Should reject invalid email format in job application', async () => {
      const invalidApplyDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email', // Invalid email format
        telephone: '+1234567890',
        documentUrl: 'https://example.com/resume.pdf',
        coverLetter: 'Test application',
        expectedSalary: 75000,
      };

      await request(app.getHttpServer())
        .post(`/api/v1/job-applications/apply/${jobId}`)
        .send(invalidApplyDto)
        .expect(400);
    });

    it('Should reject missing required fields in job creation', async () => {
      const incompleteJobDto = {
        title: 'Test Job',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/v1/job-posts')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(incompleteJobDto)
        .expect(400);
    });

    it('Should reject invalid application status update', async () => {
      const invalidUpdateDto = {
        status: 'invalid-status', // Invalid status
      };

      await request(app.getHttpServer())
        .put(`/api/v1/job-applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send(invalidUpdateDto)
        .expect(400);
    });
  });
});
