import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/user.enum';
import { CreateUserDto } from '@/root/users/dto/create-user.dto';
import { UpdateUserDto } from '@/root/users/dto/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class UserHelper {
  /**
   * Validate user email uniqueness
   */
  static async validateEmailUniqueness(
    userRepo: Repository<User>,
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const existingUser = await userRepo.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existingUser && existingUser.id !== excludeId) {
      throw new ConflictException('Email already exists');
    }
  }

  /**
   * Find user by ID with proper error handling
   */
  static async findUserById(
    userRepo: Repository<User>,
    id: string,
  ): Promise<User> {
    const user = await userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Create user with validation
   */
  static async createUser(
    userRepo: Repository<User>,
    createUserDto: CreateUserDto,
  ): Promise<User> {
    // Validate email uniqueness
    await this.validateEmailUniqueness(userRepo, createUserDto.email);

    // Create user entity
    const user = userRepo.create({
      ...createUserDto,
      isActive: createUserDto.isActive ?? true,
    });

    return userRepo.save(user);
  }

  /**
   * Update user with validation
   */
  static async updateUser(
    userRepo: Repository<User>,
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findUserById(userRepo, id);

    // Validate email uniqueness if email is being updated
    if (updateUserDto.email) {
      await this.validateEmailUniqueness(userRepo, updateUserDto.email, id);
    }

    Object.assign(user, updateUserDto);
    return userRepo.save(user);
  }

  /**
   * Soft delete user
   */
  static async softDeleteUser(
    userRepo: Repository<User>,
    id: string,
  ): Promise<void> {
    const user = await this.findUserById(userRepo, id);
    await userRepo.softRemove(user);
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(
    userRepo: Repository<User>,
    id: string,
  ): Promise<User> {
    const user = await this.findUserById(userRepo, id);
    user.isActive = false;
    return userRepo.save(user);
  }

  /**
   * Restore soft deleted user
   */
  static async restoreUser(
    userRepo: Repository<User>,
    id: string,
  ): Promise<User> {
    const user = await userRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await userRepo.restore(id);
    user.isActive = true;
    return userRepo.save(user);
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(
    userRepo: Repository<User>,
    role: UserRole,
  ): Promise<User[]> {
    return userRepo.find({ where: { role } });
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }

  /**
   * Check if user is HR
   */
  static isHR(user: User): boolean {
    return user.role === UserRole.HR;
  }

  /**
   * Check if user is company owner
   */
  static isCompanyOwner(user: User): boolean {
    return user.role === UserRole.COMPANY_OWNER;
  }

  /**
   * Format user display name
   */
  static getDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Get user full info for response
   */
  static formatUserResponse(user: User): Partial<User> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
