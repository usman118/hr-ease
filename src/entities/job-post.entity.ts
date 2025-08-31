import { JobType } from '@/enums/job.enum';
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
    description: 'Employment type',
    example: 'full-time',
    enum: JobType,
  })
  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  employmentType: JobType;

  @ApiProperty({
    description: 'Job location',
    example: 'New York, NY',
  })
  @Column()
  location: string;

  @ApiProperty({
    description: 'Salary range',
    example: '$80,000 - $120,000',
    required: false,
  })
  @Column({ name: 'salary_range', nullable: true })
  salaryRange?: string;

  @ApiProperty({
    description: 'Whether the job is remote',
    example: true,
    default: false,
  })
  @Column({ name: 'is_remote', default: false })
  isRemote: boolean;

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
    description: 'HR user ID who posted the job',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'hr_id' })
  hrId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hr_id' })
  hr: User;

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
