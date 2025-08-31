import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('company_hr')
export class CompanyHr {
  @ApiProperty({
    description: 'Unique identifier for the company-HR relationship',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    description: 'HR user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'hr_id' })
  hrId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hr_id' })
  hr: User;

  @ApiProperty({
    description: 'When the HR was assigned to the company',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
