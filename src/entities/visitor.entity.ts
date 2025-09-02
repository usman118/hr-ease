import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('visitors')
@Index(['email'])
export class Visitor {
  @ApiProperty({
    description: 'Unique identifier for the visitor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Visitor first name',
    example: 'Jane',
  })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({
    description: 'Visitor last name',
    example: 'Smith',
  })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({
    description: 'Visitor email address',
    example: 'jane.smith@example.com',
  })
  @Column()
  email: string;

  @ApiProperty({
    description: 'Visitor telephone number',
    example: '+1234567890',
    required: false,
  })
  @Column({ nullable: true })
  telephone?: string;

  @ApiProperty({
    description: 'URL to uploaded document (CV/Resume)',
    example: 'https://example.com/documents/resume.pdf',
    required: false,
  })
  @Column({ name: 'document_url', nullable: true })
  documentUrl?: string;

  @ApiProperty({
    description: 'Visitor address',
    example: '123 Main Street, City, State',
    required: false,
  })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
    required: false,
  })
  @Column({ name: 'years_of_experience', nullable: true })
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Current position/title',
    example: 'Senior Software Developer',
    required: false,
  })
  @Column({ name: 'current_position', nullable: true })
  currentPosition?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/jane-smith',
    required: false,
  })
  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl?: string;

  @ApiProperty({
    description: 'Portfolio/website URL',
    example: 'https://jane-portfolio.com',
    required: false,
  })
  @Column({ name: 'portfolio_url', nullable: true })
  portfolioUrl?: string;

  @ApiProperty({
    description: 'When the visitor record was created',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'When the visitor record was last updated',
    example: '2025-08-31T10:20:17.577Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
