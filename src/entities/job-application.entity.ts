import { ApplicationStatus } from '@/enums/application.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobPost } from './job-post.entity';
import { Visitor } from './visitor.entity';

@Entity('job_applications')
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

  @ManyToOne(() => JobPost)
  @JoinColumn({ name: 'job_id' })
  job: JobPost;

  @ApiProperty({
    description: 'Visitor ID who applied',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'visitor_id' })
  visitorId: string;

  @ManyToOne(() => Visitor)
  @JoinColumn({ name: 'visitor_id' })
  visitor: Visitor;

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
    description: 'When the application was submitted',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'applied_at' })
  appliedAt: Date;
}
