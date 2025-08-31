import { IsString, IsOptional, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Industry sector',
    example: 'Technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://techsolutions.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Company description',
    example: 'Leading provider of innovative technology solutions',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Business Street',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'Company owner ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  ownerId: string;
}
