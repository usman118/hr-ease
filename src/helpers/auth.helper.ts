import { User } from '@/entities/user.entity';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

export class AuthHelper {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(jwtService: JwtService, user: User): string {
    return jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Generate JWT reset token with expiration
   */
  static generateResetToken(
    jwtService: JwtService,
    userId: string,
    email: string,
  ): string {
    return jwtService.sign(
      {
        sub: userId,
        email,
        type: 'reset',
      },
      { expiresIn: '1h' },
    );
  }

  /**
   * Verify and decode reset token
   */
  static verifyResetToken(
    jwtService: JwtService,
    token: string,
  ): { sub: string; email: string; type: string } {
    try {
      const payload = jwtService.verify(token);
      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid token type');
      }
      return payload;
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  /**
   * Validate user exists and is active
   */
  static async validateUserExists(
    userRepo: Repository<User>,
    email: string,
  ): Promise<User> {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    return user;
  }

  /**
   * Validate user credentials for login
   */
  static async validateUserCredentials(
    userRepo: Repository<User>,
    email: string,
    password: string,
  ): Promise<User> {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /**
   * Check if email is already in use
   */
  static async checkEmailAvailability(
    userRepo: Repository<User>,
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser && existingUser.id !== excludeId) {
      throw new BadRequestException('Email already in use');
    }
  }

  /**
   * Format auth response with user data and token
   */
  static formatAuthResponse(user: User, accessToken: string) {
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Update user password with validation
   */
  static async updateUserPassword(
    userRepo: Repository<User>,
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await this.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password and update
    user.password = await this.hashPassword(newPassword);
    return userRepo.save(user);
  }

  /**
   * Generate temporary token for email verification
   */
  static generateEmailVerificationToken(
    jwtService: JwtService,
    userId: string,
    email: string,
  ): string {
    return jwtService.sign(
      {
        sub: userId,
        email,
        type: 'email_verification',
      },
      { expiresIn: '24h' },
    );
  }

  /**
   * Verify email verification token
   */
  static verifyEmailVerificationToken(
    jwtService: JwtService,
    token: string,
  ): { sub: string; email: string; type: string } {
    try {
      const payload = jwtService.verify(token);
      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid token type');
      }
      return payload;
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  /**
   * Check if password meets complexity requirements
   */
  static validatePasswordComplexity(password: string): boolean {
    // At least 6 characters, contains letter and number
    const hasMinLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasMinLength && hasLetter && hasNumber;
  }

  /**
   * Generate secure random token for various purposes
   */
  static generateRandomToken(length: number = 32): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
