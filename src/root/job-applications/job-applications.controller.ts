import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplication } from '@/entities/job-application.entity';

@ApiTags('job-applications')
@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all job applications' })
  @ApiResponse({
    status: 200,
    description: 'Returns all job applications',
    type: [JobApplication],
  })
  findAll(): Promise<JobApplication[]> {
    return this.jobApplicationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job application by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Application UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job application',
    type: JobApplication,
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<JobApplication> {
    return this.jobApplicationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiBody({ type: CreateJobApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Job application created successfully',
    type: JobApplication,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.jobApplicationsService.create(createJobApplicationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job application by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Application UUID' })
  @ApiBody({ type: UpdateJobApplicationDto })
  @ApiResponse({
    status: 200,
    description: 'Job application updated successfully',
    type: JobApplication,
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.jobApplicationsService.update(id, updateJobApplicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job application by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Application UUID' })
  @ApiResponse({
    status: 200,
    description: 'Job application deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.jobApplicationsService.remove(id);
    return { message: 'Job application deleted successfully' };
  }
}
