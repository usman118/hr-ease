import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class ApplyForJobDto {
  @ApiProperty({
    description: 'Applicant first name',
    example: 'Jane',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Applicant last name',
    example: 'Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Applicant email address',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Applicant phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telephone?: string;

  @ApiProperty({
    description: 'Applicant address',
    example: '123 Main Street, City, State 12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({
    description: 'Years of relevant experience',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Current job title/position',
    example: 'Senior Software Developer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentPosition?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/jane-smith',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiProperty({
    description: 'Portfolio or personal website URL',
    example: 'https://jane-portfolio.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({
    description: 'URL to uploaded resume/CV',
    example: 'https://example.com/resumes/jane-smith-resume.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  documentUrl?: string;

  @ApiProperty({
    description: 'Cover letter',
    example: 'I am very interested in this position because...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;

  @ApiProperty({
    description: 'Additional notes or comments',
    example: 'I am available for interviews any time next week.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    description: 'Expected salary (annual)',
    example: 75000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  expectedSalary?: number;
}
