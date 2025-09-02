import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthHelper } from '../helpers/auth.helper';

jest.mock('bcryptjs');

describe('AuthHelper', () => {
  let mockJwtService: jest.Mocked<JwtService>;
  let mockUserRepo: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    mockUserRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as any;
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await AuthHelper.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should compare password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthHelper.comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'admin',
      } as User;

      const expectedToken = 'jwt-token';
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = AuthHelper.generateAccessToken(mockJwtService, user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('generateResetToken', () => {
    it('should generate reset token with expiration', () => {
      const userId = 'user-id';
      const email = 'test@example.com';
      const expectedToken = 'reset-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = AuthHelper.generateResetToken(
        mockJwtService,
        userId,
        email,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          email,
          type: 'reset',
        },
        { expiresIn: '1h' },
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyResetToken', () => {
    it('should verify reset token successfully', () => {
      const token = 'valid-token';
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        type: 'reset',
      };

      mockJwtService.verify.mockReturnValue(payload);

      const result = AuthHelper.verifyResetToken(mockJwtService, token);

      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(payload);
    });

    it('should throw error for invalid token type', () => {
      const token = 'invalid-token';
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        type: 'invalid',
      };

      mockJwtService.verify.mockReturnValue(payload);

      expect(() => {
        AuthHelper.verifyResetToken(mockJwtService, token);
      }).toThrow(BadRequestException);
    });

    it('should throw error for expired token', () => {
      const token = 'expired-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => {
        AuthHelper.verifyResetToken(mockJwtService, token);
      }).toThrow(BadRequestException);
    });
  });

  describe('validateUserExists', () => {
    it('should return user if exists and active', async () => {
      const email = 'test@example.com';
      const user = {
        id: 'user-id',
        email,
        isActive: true,
      } as User;

      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await AuthHelper.validateUserExists(mockUserRepo, email);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });

    it('should throw error if user not found', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        AuthHelper.validateUserExists(mockUserRepo, email),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user is inactive', async () => {
      const email = 'inactive@example.com';
      const user = {
        id: 'user-id',
        email,
        isActive: false,
      } as User;

      mockUserRepo.findOne.mockResolvedValue(user);

      await expect(
        AuthHelper.validateUserExists(mockUserRepo, email),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUserCredentials', () => {
    it('should return user for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: 'user-id',
        email,
        password: 'hashedPassword',
        isActive: true,
      } as User;

      mockUserRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthHelper.validateUserCredentials(
        mockUserRepo,
        email,
        password,
      );

      expect(result).toEqual(user);
    });

    it('should throw error for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const user = {
        id: 'user-id',
        email,
        password: 'hashedPassword',
        isActive: true,
      } as User;

      mockUserRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthHelper.validateUserCredentials(mockUserRepo, email, password),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validatePasswordComplexity', () => {
    it('should return true for valid password', () => {
      const validPasswords = [
        'password123',
        'Test123',
        'myPassword1',
        'securePass999',
      ];

      validPasswords.forEach((password) => {
        expect(AuthHelper.validatePasswordComplexity(password)).toBe(true);
      });
    });

    it('should return false for invalid passwords', () => {
      const invalidPasswords = [
        'short', // Too short
        '123456', // No letters
        'password', // No numbers
        'Pass1', // Too short
      ];

      invalidPasswords.forEach((password) => {
        expect(AuthHelper.validatePasswordComplexity(password)).toBe(false);
      });
    });
  });

  describe('checkEmailAvailability', () => {
    it('should pass if email is available', async () => {
      const email = 'available@example.com';

      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        AuthHelper.checkEmailAvailability(mockUserRepo, email),
      ).resolves.not.toThrow();
    });

    it('should throw error if email is taken', async () => {
      const email = 'taken@example.com';
      const existingUser = { id: 'user-id', email } as User;

      mockUserRepo.findOne.mockResolvedValue(existingUser);

      await expect(
        AuthHelper.checkEmailAvailability(mockUserRepo, email),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pass if email belongs to excluded user', async () => {
      const email = 'test@example.com';
      const excludeId = 'user-id';
      const existingUser = { id: excludeId, email } as User;

      mockUserRepo.findOne.mockResolvedValue(existingUser);

      await expect(
        AuthHelper.checkEmailAvailability(mockUserRepo, email, excludeId),
      ).resolves.not.toThrow();
    });
  });

  describe('generateRandomToken', () => {
    it('should generate token of specified length', () => {
      const length = 16;
      const token = AuthHelper.generateRandomToken(length);

      expect(token).toHaveLength(length);
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate default length token', () => {
      const token = AuthHelper.generateRandomToken();

      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe('formatAuthResponse', () => {
    it('should format auth response correctly', () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: 'hashedPassword', // Should be excluded
      } as User;

      const accessToken = 'jwt-token';

      const result = AuthHelper.formatAuthResponse(user, accessToken);

      expect(result).toEqual({
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
      });

      expect(result.user).not.toHaveProperty('password');
    });
  });
});
