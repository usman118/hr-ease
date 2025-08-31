import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from '@/entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
    type: [UserResponseDto],
  })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('with-deleted')
  @ApiOperation({ summary: 'Get all users including soft deleted ones' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users including deleted ones',
    type: [UserResponseDto],
  })
  findAllWithDeleted(): Promise<User[]> {
    return this.usersService.findAllWithDeleted();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Soft delete user (sets deletedAt timestamp)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'User soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.softDelete(id);
    return { message: 'User soft deleted successfully' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore soft deleted user' })
  @ApiParam({ name: 'id', type: 'string', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found or not deleted' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.restore(id);
    return { message: 'User restored successfully' };
  }
}
