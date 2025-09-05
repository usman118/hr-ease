import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { User } from '@/entities/user.entity';
import { UserHelper } from '@/helpers/user.helper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // Get all users (excluding soft deleted) with pagination
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    lazy: boolean = false,
  ): Promise<PaginatedResponse<User>> {
    const queryBuilder = this.repo
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // If lazy loading is enabled, return all records without pagination
    if (lazy) {
      const users = await queryBuilder.getMany();
      return {
        data: users,
        total: users.length,
        page: 1,
        limit: users.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  // Get all users including soft deleted with pagination
  async findAllWithDeleted(
    page: number = 1,
    limit: number = 10,
    search?: string,
    lazy: boolean = false,
  ): Promise<PaginatedResponse<User>> {
    const queryBuilder = this.repo
      .createQueryBuilder('user')
      .withDeleted()
      .orderBy('user.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // If lazy loading is enabled, return all records without pagination
    if (lazy) {
      const users = await queryBuilder.getMany();
      return {
        data: users,
        total: users.length,
        page: 1,
        limit: users.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  // Get user by ID
  async findOne(id: string): Promise<User> {
    return UserHelper.findUserById(this.repo, id);
  }

  // Create new user
  async create(createUserDto: CreateUserDto): Promise<User> {
    return UserHelper.createUser(this.repo, createUserDto);
  }

  // Update user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return UserHelper.updateUser(this.repo, id, updateUserDto);
  }

  // Hard delete user (permanently remove)
  async remove(id: string): Promise<void> {
    const user = await UserHelper.findUserById(this.repo, id);
    await this.repo.remove(user);
  }

  // Soft delete user (sets deletedAt timestamp)
  async softDelete(id: string): Promise<void> {
    return UserHelper.softDeleteUser(this.repo, id);
  }

  // Restore soft deleted user
  async restore(id: string): Promise<void> {
    await UserHelper.restoreUser(this.repo, id);
  }
}
