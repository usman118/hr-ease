import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token received in email',
    example: 'abc123xyz789token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password for the account',
    example: 'SecurePassword123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 0,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password must contain at least 6 characters, 1 letter, and 1 number',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Confirm password',
    example: 'SecurePassword123!',
  })
  @IsString()
  confirmPassword: string;
}

export class ValidateInvitationDto {
  @ApiProperty({
    description: 'Invitation token to validate',
    example: 'abc123xyz789token',
  })
  @IsString()
  token: string;
}
