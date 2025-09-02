import { UserRole } from '@/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'owner@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User role',
    example: 'company_owner',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Company ID to assign user to (optional)',
    example: 'uuid-company-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}

export class InviteUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'hr@company.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Jane',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Smith',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User role',
    example: 'hr',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Company ID to assign user to',
    example: 'uuid-company-id',
  })
  @IsUUID()
  companyId: string;
}

export class AssignCompanyDto {
  @ApiProperty({
    description: 'Company ID to assign to user',
    example: 'uuid-company-id',
  })
  @IsUUID()
  companyId: string;
}
