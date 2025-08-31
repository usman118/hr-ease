import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('visitors')
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
    description: 'When the visitor record was created',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
