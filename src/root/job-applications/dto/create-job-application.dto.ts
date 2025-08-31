import { ApplicationStatus } from '@/enums/application.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateJobApplicationDto {
  @ApiProperty({ description: 'Cover letter or application message' })
  @IsString()
  @IsNotEmpty()
  coverLetter: string;

  @ApiProperty({
    description: 'Resume/CV file path or content',
    required: false,
  })
  @IsOptional()
  @IsString()
  resume?: string;

  @ApiProperty({
    enum: ApplicationStatus,
    description: 'Application status',
    default: ApplicationStatus.PENDING,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus = ApplicationStatus.PENDING;

  @ApiProperty({ description: 'Job Post ID' })
  @IsUUID()
  @IsNotEmpty()
  jobPostId: string;

  @ApiProperty({ description: 'Visitor ID (applicant)' })
  @IsUUID()
  @IsNotEmpty()
  visitorId: string;
}
