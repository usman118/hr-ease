import { JobLevel, JobType } from '@/enums/job.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateJobPostDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Job description',
    example:
      'We are looking for a senior software engineer to join our team...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Job requirements',
    example: '5+ years of experience in TypeScript, React, and Node.js',
  })
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiProperty({
    description: 'Job location',
    example: 'New York, NY',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Annual salary amount',
    example: 120000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  salary?: number;

  @ApiProperty({
    enum: JobType,
    description: 'Type of employment',
    example: JobType.FULL_TIME,
  })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({
    enum: JobLevel,
    description: 'Job experience level',
    example: JobLevel.SENIOR,
  })
  @IsEnum(JobLevel)
  jobLevel: JobLevel;
}
