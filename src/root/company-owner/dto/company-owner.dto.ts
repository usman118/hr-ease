import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateHrUserDto {
  @ApiProperty({
    description: 'HR user email address',
    example: 'hr@company.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'HR user first name',
    example: 'Sarah',
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    description: 'HR user last name',
    example: 'Johnson',
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;
}

export class InviteHrUserDto extends CreateHrUserDto {
  @ApiProperty({
    description: 'Optional message to include in invitation email',
    example: 'Welcome to our HR team!',
    required: false,
  })
  @IsString({ message: 'Message must be a string' })
  message?: string;
}
