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
import { JobPostsService } from './job-posts.service';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { JobPost } from '@/entities/job-post.entity';

@ApiTags('job-posts')
@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all job posts' })
  @ApiResponse({
    status: 200,
    description: 'Returns all job posts',
    type: [JobPost],
  })
  findAll(): Promise<JobPost[]> {
    return this.jobPostsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job post by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Post UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job post',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<JobPost> {
    return this.jobPostsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job post' })
  @ApiBody({ type: CreateJobPostDto })
  @ApiResponse({
    status: 201,
    description: 'Job post created successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createJobPostDto: CreateJobPostDto): Promise<JobPost> {
    return this.jobPostsService.create(createJobPostDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job post by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Post UUID' })
  @ApiBody({ type: UpdateJobPostDto })
  @ApiResponse({
    status: 200,
    description: 'Job post updated successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobPostDto: UpdateJobPostDto,
  ): Promise<JobPost> {
    return this.jobPostsService.update(id, updateJobPostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job post by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Job Post UUID' })
  @ApiResponse({ status: 200, description: 'Job post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.jobPostsService.remove(id);
    return { message: 'Job post deleted successfully' };
  }
}
