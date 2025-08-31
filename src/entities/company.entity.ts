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
import { User } from './user.entity';

@Entity('companies')
export class Company {
  @ApiProperty({
    description: 'Unique identifier for the company',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Industry sector',
    example: 'Technology',
    required: false,
  })
  @Column({ nullable: true })
  industry?: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://techsolutions.com',
    required: false,
  })
  @Column({ nullable: true })
  website?: string;

  @ApiProperty({
    description: 'Company description',
    example: 'Leading provider of innovative technology solutions',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Business Street',
    required: false,
  })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    required: false,
  })
  @Column({ nullable: true })
  city?: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
    required: false,
  })
  @Column({ nullable: true })
  country?: string;

  @ApiProperty({
    description: 'Company owner ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ApiProperty({
    description: 'When the company was created',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'When the company was last updated',
    example: '2025-08-31T10:25:17.577Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
