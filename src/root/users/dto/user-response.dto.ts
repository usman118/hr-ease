import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    example: 'hr',
  })
  role: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profileImage?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'When the user account was created',
    example: '2025-08-31T10:20:17.577Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the user account was last updated',
    example: '2025-08-31T10:25:17.577Z',
  })
  updatedAt: Date;
}
