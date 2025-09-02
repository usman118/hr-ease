import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationStatus } from '../enums/application.enum';
import { JobPost } from './job-post.entity';
import { Visitor } from './visitor.entity';

@Entity('job_applications')
@Unique(['jobId', 'visitorId']) // Ensure each visitor record can apply only once per job
@Index(['jobId', 'status'])
export class JobApplication {
  @ApiProperty({
    description: 'Unique identifier for the job application',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Job post ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => JobPost, { eager: true })
  @JoinColumn({ name: 'job_id' })
  job: JobPost;

  @ApiProperty({
    description: 'Visitor ID who applied',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'visitor_id' })
  visitorId: string;

  @ManyToOne(() => Visitor, { eager: true })
  @JoinColumn({ name: 'visitor_id' })
  visitor: Visitor;

  @ApiProperty({
    description: 'Cover letter from the applicant',
    example: 'I am very interested in this position because...',
    required: false,
  })
  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter?: string;

  @ApiProperty({
    description: 'Additional notes from the applicant',
    example: 'I am available for interviews any time next week.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    description: 'Expected salary (if provided by applicant)',
    example: 75000,
    required: false,
  })
  @Column({
    name: 'expected_salary',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  expectedSalary?: number;

  @ApiProperty({
    description: 'Application status',
    example: 'pending',
    enum: ApplicationStatus,
  })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'HR/Owner notes about the application',
    example: 'Good candidate, schedule for interview',
    required: false,
  })
  @Column({ name: 'hr_notes', type: 'text', nullable: true })
  hrNotes?: string;

  @ApiProperty({
    description: 'When the application was submitted',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'applied_at' })
  appliedAt: Date;

  @ApiProperty({
    description: 'When the application was last updated',
    example: '2025-08-31T10:20:17.577Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
