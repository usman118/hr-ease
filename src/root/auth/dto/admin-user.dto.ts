import { UserRole } from '@/enums/user.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOwnerOrHrDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@company.com',
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
    description: 'User role - either company_owner or hr',
    example: 'company_owner',
    enum: [UserRole.COMPANY_OWNER, UserRole.HR],
  })
  @IsEnum([UserRole.COMPANY_OWNER, UserRole.HR])
  role: UserRole.COMPANY_OWNER | UserRole.HR;

  @ApiProperty({
    description:
      'Company ID to assign user to. Optional for owners, required for HR',
    example: 'uuid-company-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}

export class AssignCompanyDto {
  @ApiProperty({
    description: 'Company ID to assign to user',
    example: 'uuid-company-id',
  })
  @IsUUID()
  companyId: string;
}
