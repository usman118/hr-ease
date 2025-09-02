import { JobPost } from '@/entities/job-post.entity';
import { HrOrAdminGuard } from '@/root/auth/guards/hr-or-admin.guard';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/types/request.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { UpdateJobPostDto } from './dto/update-job-post.dto';
import { JobPostsService } from './job-posts.service';

@ApiTags('job-posts')
@Controller('job-posts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all job posts (public endpoint)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns all job posts',
    type: [JobPost],
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<{
    jobPosts: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.jobPostsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get('my-posts')
  @ApiOperation({
    summary: 'Get job posts created by current user (HR/Company Owner)',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns job posts created by current user',
    type: [JobPost],
  })
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  findMyPosts(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<{
    jobPosts: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.jobPostsService.findUserJobPosts(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Get job post statistics for current user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Job post statistics retrieved successfully',
  })
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  async getStatistics(@Req() req: RequestWithUser): Promise<{
    message: string;
    data: {
      totalJobPosts: number;
      activeJobPosts: number;
      inactiveJobPosts: number;
      jobPostsCreatedThisMonth: number;
      jobPostsByType: { type: string; count: number }[];
      jobPostsByLevel: { level: string; count: number }[];
    };
  }> {
    const statistics = await this.jobPostsService.getStatistics(req.user.id);
    return {
      message: 'Job post statistics retrieved successfully',
      data: statistics,
    };
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
  @ApiBearerAuth()
  @ApiBody({ type: CreateJobPostDto })
  @ApiResponse({
    status: 201,
    description: 'Job post created successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  async create(
    @Body() createJobPostDto: CreateJobPostDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; data: JobPost }> {
    const jobPost = await this.jobPostsService.create(
      createJobPostDto,
      req.user.id,
    );
    return {
      message: 'Job post created successfully',
      data: jobPost,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job post by ID' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', description: 'Job Post UUID' })
  @ApiBody({ type: UpdateJobPostDto })
  @ApiResponse({
    status: 200,
    description: 'Job post updated successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobPostDto: UpdateJobPostDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; data: JobPost }> {
    const jobPost = await this.jobPostsService.update(
      id,
      updateJobPostDto,
      req.user.id,
    );
    return {
      message: 'Job post updated successfully',
      data: jobPost,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job post by ID' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', description: 'Job Post UUID' })
  @ApiResponse({ status: 200, description: 'Job post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.jobPostsService.remove(id, req.user.id);
    return { message: 'Job post deleted successfully' };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle job post status (active/inactive)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', description: 'Job Post UUID' })
  @ApiResponse({
    status: 200,
    description: 'Job post status toggled successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job post not found' })
  @UseGuards(JwtAuthGuard, HrOrAdminGuard)
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; data: JobPost }> {
    const jobPost = await this.jobPostsService.toggleStatus(id, req.user.id);
    return {
      message: 'Job post status toggled successfully',
      data: jobPost,
    };
  }
}
