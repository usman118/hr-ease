import { UserRole } from '@/enums/user.enum';
import { GetUser, JwtAuthGuard, Roles } from '@/root/auth';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@GetUser() user: any) {
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin only endpoint example' })
  adminOnly(@GetUser() user: any) {
    return {
      message: 'This is an admin-only endpoint',
      user,
    };
  }

  @Get('hr-or-admin')
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiOperation({ summary: 'HR or Admin only endpoint example' })
  hrOrAdmin(@GetUser() user: any) {
    return {
      message: 'This endpoint is accessible by HR or Admin users',
      user,
    };
  }
}
