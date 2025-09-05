import { User } from '@/entities/user.entity';
import { UserRole } from '@/enums/user.enum';
import { AuthHelper, UserHelper } from '@/helpers';
import { ForgotPasswordDto } from '@/root/auth/dto/forgot-password.dto';
import { AcceptInvitationDto } from '@/root/auth/dto/invitation.dto';
import { LoginDto } from '@/root/auth/dto/login.dto';
import { ResetPasswordDto } from '@/root/auth/dto/reset-password.dto';
import { SignupDto } from '@/root/auth/dto/signup.dto';
import { UpdatePasswordDto } from '@/root/auth/dto/update-password.dto';
import { EmailService } from '@/services/email.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    const { email, password, firstName, lastName } = dto;

    // Check if email is already in use
    await AuthHelper.checkEmailAvailability(this.userRepo, email);

    // Hash password and create admin user (signup is admin-only)
    const hashedPassword = await AuthHelper.hashPassword(password);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.ADMIN, // Set role to admin for signup
    });
    await this.userRepo.save(user);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      // Log error but don't fail the signup process
      this.logger.warn('Failed to send welcome email:', error.message);
    }

    // Generate token and return response
    const accessToken = AuthHelper.generateAccessToken(this.jwtService, user);
    return AuthHelper.formatAuthResponse(user, accessToken);
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    // Validate user credentials
    const user = await AuthHelper.validateUserCredentials(
      this.userRepo,
      email,
      password,
    );

    // Generate token and return response
    const accessToken = AuthHelper.generateAccessToken(this.jwtService, user);
    return AuthHelper.formatAuthResponse(user, accessToken);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    // Validate user exists and is active
    const user = await AuthHelper.validateUserExists(this.userRepo, email);

    // Generate reset token
    const resetToken = AuthHelper.generateResetToken(
      this.jwtService,
      user.id,
      user.email,
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, {
        firstName: user.firstName,
        resetToken,
      });

      return {
        message: 'Password reset email sent',
        // Include token in response for development/testing purposes
        // Remove this in production
        resetToken,
      };
    } catch (error) {
      this.logger.error('Failed to send password reset email:', error.message);

      // Still return the token for development even if email fails
      return {
        message: 'Password reset token generated (email sending failed)',
        resetToken,
      };
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    // Verify and decode reset token
    const payload = AuthHelper.verifyResetToken(this.jwtService, token);

    // Find user by ID from token payload
    const user = await UserHelper.findUserById(this.userRepo, payload.sub);

    // Hash new password and update user
    user.password = await AuthHelper.hashPassword(newPassword);
    await this.userRepo.save(user);

    // Send password changed notification email
    try {
      await this.emailService.sendPasswordChangedNotification(
        user.email,
        user.firstName,
      );
    } catch (error) {
      this.logger.warn(
        'Failed to send password change notification:',
        error.message,
      );
    }

    return {
      message: 'Password reset successfully',
    };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const { oldPassword, newPassword } = dto;

    // Get user details before updating password
    const user = await UserHelper.findUserById(this.userRepo, userId);

    // Update password using helper with validation
    await AuthHelper.updateUserPassword(
      this.userRepo,
      userId,
      oldPassword,
      newPassword,
    );

    // Send password changed notification email
    try {
      await this.emailService.sendPasswordChangedNotification(
        user.email,
        user.firstName,
      );
    } catch (error) {
      this.logger.warn(
        'Failed to send password change notification:',
        error.message,
      );
    }

    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * Validate invitation token
   */
  async validateInvitation(token: string) {
    const user = await this.userRepo.findOne({
      where: { invitationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (!user.invitationExpiresAt || user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invitation token has expired');
    }

    if (user.invitationAccepted) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    return {
      message: 'Invitation token is valid',
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Accept invitation and set password
   */
  async acceptInvitation(dto: AcceptInvitationDto) {
    const { token, password, confirmPassword } = dto;

    // Validate that passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user by invitation token
    const user = await this.userRepo.findOne({
      where: { invitationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (!user.invitationExpiresAt || user.invitationExpiresAt < new Date()) {
      throw new BadRequestException('Invitation token has expired');
    }

    if (user.invitationAccepted) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    // Hash the new password
    const hashedPassword = await AuthHelper.hashPassword(password);

    // Update user: set password, activate account, clear invitation data
    user.password = hashedPassword;
    user.isActive = true;
    user.invitationAccepted = true;
    user.invitationToken = undefined;
    user.invitationExpiresAt = undefined;

    const savedUser = await this.userRepo.save(user);

    // Generate JWT token for immediate login
    const accessToken = AuthHelper.generateAccessToken(
      this.jwtService,
      savedUser,
    );

    return AuthHelper.formatAuthResponse(savedUser, accessToken);
  }
}
