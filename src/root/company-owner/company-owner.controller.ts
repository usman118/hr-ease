import { User } from '@/entities/user.entity';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/types/request.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyOwnerService } from './company-owner.service';
import { CreateHrUserDto, InviteHrUserDto } from './dto/company-owner.dto';

@ApiTags('company-owner')
@ApiBearerAuth('JWT-auth')
@Controller('company-owner')
@UseGuards(JwtAuthGuard)
export class CompanyOwnerController {
  constructor(private readonly companyOwnerService: CompanyOwnerService) {}

  @Post('hr-users')
  @ApiOperation({ summary: 'Create HR user for your company' })
  @ApiResponse({ status: 201, description: 'HR user created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a company owner' })
  async createHrUser(
    @Body() createHrUserDto: CreateHrUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; user: User }> {
    const result = await this.companyOwnerService.createHrUser(
      createHrUserDto,
      req.user,
    );
    return {
      message: 'HR user created successfully',
      user: result.user,
    };
  }

  @Post('hr-users/invite')
  @ApiOperation({ summary: 'Create and invite HR user via email' })
  @ApiResponse({
    status: 201,
    description: 'HR user invited successfully. Email sent.',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a company owner' })
  async inviteHrUser(
    @Body() inviteHrUserDto: InviteHrUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; user: User }> {
    const hrUser = await this.companyOwnerService.inviteHrUser(
      inviteHrUserDto,
      req.user,
    );
    return {
      message: 'HR user invited successfully. Invitation email has been sent.',
      user: hrUser,
    };
  }

  @Get('hr-users')
  @ApiOperation({ summary: 'Get all HR users for your company' })
  @ApiResponse({
    status: 200,
    description: 'List of HR users retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not a company owner' })
  async getMyHrUsers(@Req() req: RequestWithUser): Promise<User[]> {
    return await this.companyOwnerService.getMyHrUsers(req.user);
  }

  @Get('company')
  @ApiOperation({ summary: 'Get your company information' })
  @ApiResponse({
    status: 200,
    description: 'Company information retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not a company owner' })
  async getMyCompany(@Req() req: RequestWithUser) {
    return await this.companyOwnerService.getMyCompany(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({
    status: 200,
    description: 'Company statistics retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - not a company owner' })
  async getCompanyStats(@Req() req: RequestWithUser) {
    return await this.companyOwnerService.getCompanyStats(req.user);
  }

  @Delete('hr-users/:hrUserId')
  @ApiOperation({ summary: 'Remove HR user from your company' })
  @ApiResponse({ status: 200, description: 'HR user removed successfully' })
  @ApiResponse({ status: 400, description: 'HR user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a company owner' })
  async removeHrUser(
    @Param('hrUserId') hrUserId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.companyOwnerService.removeHrUser(hrUserId, req.user);
    return {
      message: 'HR user removed from company successfully',
    };
  }
}
