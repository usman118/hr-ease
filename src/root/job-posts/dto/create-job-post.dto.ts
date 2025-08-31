import { JobLevel, JobType } from '@/enums/job.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateJobPostDto {
  @ApiProperty({ description: 'Job title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Job requirements' })
  @IsString()
  @IsNotEmpty()
  requirements: string;

  @ApiProperty({ description: 'Job location' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Salary amount', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  salary?: number;

  @ApiProperty({ enum: JobType, description: 'Job type' })
  @IsEnum(JobType)
  jobType: JobType;

  @ApiProperty({ enum: JobLevel, description: 'Job level' })
  @IsEnum(JobLevel)
  jobLevel: JobLevel;

  @ApiProperty({ description: 'Company ID' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: 'Company HR ID', required: false })
  @IsOptional()
  @IsUUID()
  companyHrId?: string;
}
