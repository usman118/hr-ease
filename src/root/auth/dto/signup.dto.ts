import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Admin-only signup DTO
 * Only admins can create new accounts
 */
export class SignupDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@hrease.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Admin password (minimum 6 characters)',
    example: 'adminpassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Admin first name',
    example: 'System',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'Administrator',
  })
  @IsString()
  lastName: string;
}
