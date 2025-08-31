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

  // Get all users (excluding soft deleted)
  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  // Get all users including soft deleted
  findAllWithDeleted(): Promise<User[]> {
    return this.repo.find({ withDeleted: true });
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
