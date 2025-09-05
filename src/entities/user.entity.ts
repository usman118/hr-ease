import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user.enum';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @Column({ nullable: true })
  password?: string;

  @ApiProperty({
    description: 'Invitation token for account setup',
    required: false,
  })
  @Column({ name: 'invitation_token', nullable: true })
  invitationToken?: string;

  @ApiProperty({
    description: 'When invitation token expires',
    required: false,
  })
  @Column({ name: 'invitation_expires_at', nullable: true })
  invitationExpiresAt?: Date;

  @ApiProperty({
    description: 'Whether user has accepted invitation and set password',
    example: false,
    default: false,
  })
  @Column({ name: 'invitation_accepted', default: false })
  invitationAccepted: boolean;

  @ApiProperty({
    description: 'User role',
    example: 'hr',
    enum: UserRole,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.HR,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @Column({ name: 'profile_image', nullable: true })
  profileImage?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'When the user account was created',
    example: '2025-08-31T10:20:17.577Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'When the user account was last updated',
    example: '2025-08-31T10:25:17.577Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
