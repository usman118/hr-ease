import { JobApplication } from '@/entities/job-application.entity';
import { HrOrAdminGuard } from '@/root/auth/guards/hr-or-admin.guard';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/types/request.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplyForJobDto } from './dto/apply-for-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JobApplicationsService } from './job-applications.service';

@ApiTags('job-applications')
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post('apply/:jobId')
  @ApiOperation({ summary: 'Apply for a job (public endpoint)' })
  @ApiParam({ name: 'jobId', type: 'string', description: 'Job Post UUID' })
  @ApiBody({ type: ApplyForJobDto })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: JobApplication,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  async applyForJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() applyForJobDto: ApplyForJobDto,
  ): Promise<{ message: string; application: JobApplication }> {
    return this.jobApplicationsService.applyForJob(jobId, applyForJobDto);
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all applications for my company (HR/Owner)' })
  @ApiResponse({
    status: 200,
    description: "Returns all applications for the user's company",
    type: [JobApplication],
  })
  async getMyJobApplications(@Req() req: RequestWithUser): Promise<{
    applications: JobApplication[];
    total: number;
  }> {
    return this.jobApplicationsService.getMyJobApplications(req.user.id);
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications for a specific job (HR/Owner)' })
  @ApiParam({ name: 'jobId', type: 'string', description: 'Job Post UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns applications for the specified job',
    type: [JobApplication],
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getApplicationsForJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req: RequestWithUser,
  ): Promise<JobApplication[]> {
    return this.jobApplicationsService.getApplicationsForJob(
      jobId,
      req.user.id,
    );
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get application statistics for my company (HR/Owner)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns application statistics',
  })
  async getApplicationStatistics(@Req() req: RequestWithUser): Promise<{
    totalApplications: number;
    pendingApplications: number;
    reviewingApplications: number;
    shortlistedApplications: number;
    rejectedApplications: number;
    acceptedApplications: number;
    applicationsByJob: { jobTitle: string; count: number }[];
  }> {
    return this.jobApplicationsService.getApplicationStatistics(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job application by ID (HR/Owner)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Application UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job application',
    type: JobApplication,
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<JobApplication> {
    return this.jobApplicationsService.getApplicationById(id, req.user.id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status (HR/Owner)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Application UUID' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
    type: JobApplication,
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<JobApplication> {
    return this.jobApplicationsService.updateApplicationStatus(
      id,
      updateStatusDto,
      req.user.id,
    );
  }
}
