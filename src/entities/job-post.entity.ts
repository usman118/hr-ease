import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobLevel, JobType } from '../enums/job.enum';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('job_posts')
export class JobPost {
  @ApiProperty({
    description: 'Unique identifier for the job post',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for a senior software engineer...',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Job requirements',
    example: '5+ years of experience in TypeScript...',
  })
  @Column({ type: 'text' })
  requirements: string;

  @ApiProperty({
    description: 'Job type',
    example: 'full-time',
    enum: JobType,
  })
  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  jobType: JobType;

  @ApiProperty({
    description: 'Job level',
    example: 'senior',
    enum: JobLevel,
  })
  @Column({
    name: 'job_level',
    type: 'enum',
    enum: JobLevel,
    default: JobLevel.MID,
  })
  jobLevel: JobLevel;

  @ApiProperty({
    description: 'Job location',
    example: 'New York, NY',
  })
  @Column()
  location: string;

  @ApiProperty({
    description: 'Salary amount',
    example: 120000,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary?: number;

  @ApiProperty({
    description: 'Company ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty({
    description: 'User ID who posted the job (HR or Company Owner)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @ApiProperty({
    description: 'Whether the job post is active',
    example: true,
    default: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'When the job post was created',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'When the job post was last updated',
    example: '2025-08-31T10:25:17.577Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
