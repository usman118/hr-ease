import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { User } from '@/entities/user.entity';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/types/request.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users with basic information (public listing)',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Returns paginated users with basic information only',
  })
  findAll(
    @Req() _req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('lazy') lazy?: string,
  ): Promise<PaginatedResponse<Partial<User>>> {
    const isLazy = lazy === 'true';
    return this.usersService.findAllBasic(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      isLazy,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user (own profile or basic info)',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only view own profile or basic user info',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<User | Partial<User>> {
    return this.usersService.findOneSecure(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user profile (own profile only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only update own profile',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    return this.usersService.updateSecure(id, updateUserDto, req.user.id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate own account (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Account deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied - can only deactivate own account',
  })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.usersService.softDeleteSecure(id, req.user.id);
    return { message: 'Account deactivated successfully' };
  }
}
