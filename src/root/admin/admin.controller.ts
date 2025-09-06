import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { User } from '@/entities/user.entity';
import {
  AssignCompanyDto,
  CreateOwnerOrHrDto,
} from '@/root/auth/dto/admin-user.dto';
import { AdminGuard } from '@/root/auth/guards/admin.guard';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/types/request.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('debug/whoami')
  @ApiOperation({ summary: 'Debug: Check current admin user info' })
  async whoAmI(@Req() req: RequestWithUser): Promise<any> {
    return {
      message: 'Token is valid',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Create owner or HR user with invitation',
    description:
      'Create a company owner or HR user. Company is optional for owners, required for HR. User will receive an invitation email.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created and invitation sent successfully',
  })
  async createOwnerOrHr(
    @Body() createOwnerOrHrDto: CreateOwnerOrHrDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; user: User; invitationToken: string }> {
    const result = await this.adminService.createOwnerOrHr(
      createOwnerOrHrDto,
      req.user,
    );
    return {
      message: 'User created and invitation sent successfully',
      user: result.user,
      invitationToken: result.invitationToken,
    };
  }

  @Put('users/:userId/assign-company')
  @UseGuards(AdminGuard)
  async assignCompanyToUser(
    @Param('userId') userId: string,
    @Body() assignCompanyDto: AssignCompanyDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.adminService.assignCompanyToUser(
      userId,
      assignCompanyDto,
      req.user,
    );
    return {
      message: 'Company assigned to user successfully',
    };
  }

  @Get('users')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'lazy',
    required: false,
    type: Boolean,
    description: 'Load all records at once (ignores pagination)',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Req() _req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('lazy') lazy?: string,
  ): Promise<PaginatedResponse<User>> {
    const isLazy = lazy === 'true';
    return await this.adminService.getAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      isLazy,
    );
  }

  @Get('companies')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'lazy',
    required: false,
    type: Boolean,
    description: 'Load all records at once (ignores pagination)',
  })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async getAllCompanies(
    @Req() _req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('lazy') lazy?: string,
  ): Promise<PaginatedResponse<any>> {
    const isLazy = lazy === 'true';
    return await this.adminService.getAllCompanies(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      isLazy,
    );
  }

  @Post('companies/:companyId/owners/:userId')
  @UseGuards(AdminGuard)
  async assignCompanyOwner(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.adminService.assignCompanyOwner(companyId, userId, req.user);
    return {
      message: 'Company owner assigned successfully',
    };
  }
}
