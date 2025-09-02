import { ApplicationStatus } from '@/enums/application.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'Application status',
    example: 'reviewing',
    enum: ApplicationStatus,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({
    description: 'HR notes about the application status change',
    example: 'Candidate looks promising, moving to interview stage',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  hrNotes?: string;
}
