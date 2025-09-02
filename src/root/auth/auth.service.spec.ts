import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { AuthHelper } from '../../helpers/auth.helper';
import { UserHelper } from '../../helpers/user.helper';
import { EmailService } from '../../services/email.service';
import { AuthService } from './auth.service';

jest.mock('../../helpers/auth.helper');
jest.mock('../../helpers/user.helper');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    isActive: true,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn().mockResolvedValue(true),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
            sendPasswordChangedNotification: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should register new admin user successfully', async () => {
      const signupDto = {
        email: 'newadmin@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const hashedPassword = 'hashedPassword123';
      const newUser = {
        ...mockUser,
        ...signupDto,
        password: hashedPassword,
        role: 'admin',
      };

      const expectedResponse = {
        access_token: 'jwt-token',
        user: newUser,
      };

      (AuthHelper.checkEmailAvailability as jest.Mock).mockResolvedValue(
        undefined,
      );
      (AuthHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockReturnValue(newUser as any);
      userRepository.save.mockResolvedValue(newUser as any);
      (AuthHelper.generateAccessToken as jest.Mock).mockReturnValue(
        'jwt-token',
      );
      (AuthHelper.formatAuthResponse as jest.Mock).mockReturnValue(
        expectedResponse,
      );
      emailService.sendWelcomeEmail.mockResolvedValue(true);

      const result = await service.signup(signupDto);

      expect(AuthHelper.checkEmailAvailability).toHaveBeenCalledWith(
        userRepository,
        signupDto.email,
      );
      expect(AuthHelper.hashPassword).toHaveBeenCalledWith(signupDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...signupDto,
        password: hashedPassword,
        role: 'admin',
      });
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        signupDto.email,
        signupDto.firstName,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email service failure gracefully', async () => {
      const signupDto = {
        email: 'newadmin@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const hashedPassword = 'hashedPassword123';
      const newUser = {
        ...mockUser,
        ...signupDto,
        password: hashedPassword,
        role: 'admin',
      };

      const expectedResponse = {
        access_token: 'jwt-token',
        user: newUser,
      };

      (AuthHelper.checkEmailAvailability as jest.Mock).mockResolvedValue(
        undefined,
      );
      (AuthHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockReturnValue(newUser as any);
      userRepository.save.mockResolvedValue(newUser as any);
      (AuthHelper.generateAccessToken as jest.Mock).mockReturnValue(
        'jwt-token',
      );
      (AuthHelper.formatAuthResponse as jest.Mock).mockReturnValue(
        expectedResponse,
      );
      emailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service failed'),
      );

      const result = await service.signup(signupDto);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          isActive: mockUser.isActive,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };

      (AuthHelper.validateUserCredentials as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (AuthHelper.generateAccessToken as jest.Mock).mockReturnValue(
        'jwt-token',
      );
      (AuthHelper.formatAuthResponse as jest.Mock).mockReturnValue(
        expectedResponse,
      );

      const result = await service.login(loginDto);

      expect(AuthHelper.validateUserCredentials).toHaveBeenCalledWith(
        userRepository,
        loginDto.email,
        loginDto.password,
      );
      expect(AuthHelper.generateAccessToken).toHaveBeenCalledWith(
        jwtService,
        mockUser,
      );
      expect(AuthHelper.formatAuthResponse).toHaveBeenCalledWith(
        mockUser,
        'jwt-token',
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email for existing user', async () => {
      const email = 'test@example.com';
      const resetToken = 'reset-token';

      (AuthHelper.validateUserExists as jest.Mock).mockResolvedValue(mockUser);
      (AuthHelper.generateResetToken as jest.Mock).mockReturnValue(resetToken);
      emailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await service.forgotPassword({ email });

      expect(AuthHelper.validateUserExists).toHaveBeenCalledWith(
        userRepository,
        email,
      );
      expect(AuthHelper.generateResetToken).toHaveBeenCalledWith(
        jwtService,
        mockUser.id,
        mockUser.email,
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser.email,
        {
          firstName: mockUser.firstName,
          resetToken,
        },
      );
      expect(result).toEqual({
        message: 'Password reset email sent',
        resetToken,
      });
    });

    it('should handle email service failure and still return token', async () => {
      const email = 'test@example.com';
      const resetToken = 'reset-token';

      (AuthHelper.validateUserExists as jest.Mock).mockResolvedValue(mockUser);
      (AuthHelper.generateResetToken as jest.Mock).mockReturnValue(resetToken);
      emailService.sendPasswordResetEmail.mockRejectedValue(
        new Error('Email service failed'),
      );

      const result = await service.forgotPassword({ email });

      expect(result).toEqual({
        message: 'Password reset token generated (email sending failed)',
        resetToken,
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const resetDto = {
        token: 'valid-reset-token',
        newPassword: 'newPassword123',
      };

      const tokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        type: 'reset',
      };

      const hashedPassword = 'newHashedPassword';

      (AuthHelper.verifyResetToken as jest.Mock).mockReturnValue(tokenPayload);
      (UserHelper.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (AuthHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });
      emailService.sendPasswordChangedNotification.mockResolvedValue(true);

      const result = await service.resetPassword(resetDto);

      expect(AuthHelper.verifyResetToken).toHaveBeenCalledWith(
        jwtService,
        resetDto.token,
      );
      expect(UserHelper.findUserById).toHaveBeenCalledWith(
        userRepository,
        tokenPayload.sub,
      );
      expect(AuthHelper.hashPassword).toHaveBeenCalledWith(
        resetDto.newPassword,
      );
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: hashedPassword,
      });
      expect(emailService.sendPasswordChangedNotification).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
      );
      expect(result).toEqual({
        message: 'Password reset successfully',
      });
    });
  });

  describe('updatePassword', () => {
    it('should update password for authenticated user', async () => {
      const userId = 'user-id';
      const updatePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      (UserHelper.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (AuthHelper.updateUserPassword as jest.Mock).mockResolvedValue(mockUser);
      emailService.sendPasswordChangedNotification.mockResolvedValue(true);

      const result = await service.updatePassword(userId, updatePasswordDto);

      expect(UserHelper.findUserById).toHaveBeenCalledWith(
        userRepository,
        userId,
      );
      expect(AuthHelper.updateUserPassword).toHaveBeenCalledWith(
        userRepository,
        userId,
        updatePasswordDto.oldPassword,
        updatePasswordDto.newPassword,
      );
      expect(emailService.sendPasswordChangedNotification).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
      );
      expect(result).toEqual({
        message: 'Password updated successfully',
      });
    });
  });
});
