import { User } from '@/entities/user.entity';
import {
  AssignCompanyDto,
  CreateUserDto,
  InviteUserDto,
} from '@/root/auth/dto/admin-user.dto';
import { AdminGuard } from '@/root/auth/guards/admin.guard';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/types/request.interface';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users')
  @UseGuards(AdminGuard)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; user: User; tempPassword?: string }> {
    const result = await this.adminService.createUser(createUserDto, req.user);
    return {
      message: 'User created successfully',
      user: result.user,
      tempPassword: result.tempPassword, // Include temp password for testing
    };
  }

  @Post('users/invite')
  @UseGuards(AdminGuard)
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; user: User }> {
    const result = await this.adminService.inviteUser(inviteUserDto, req.user);
    return {
      message: 'User invited successfully. Invitation email has been sent.',
      user: result,
    };
  }

  @Put('users/:userId/assign-company')
  @UseGuards(AdminGuard)
  async assignCompanyToUser(
    @Param('userId') userId: string,
    @Body() assignCompanyDto: AssignCompanyDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.adminService.assignCompanyToUser(
      userId,
      assignCompanyDto,
      req.user,
    );
    return {
      message: 'Company assigned to user successfully',
    };
  }

  @Get('users')
  @UseGuards(AdminGuard)
  async getAllUsers(@Req() _req: RequestWithUser): Promise<User[]> {
    return await this.adminService.getAllUsers();
  }

  @Get('companies')
  @UseGuards(AdminGuard)
  async getAllCompanies(@Req() _req: RequestWithUser) {
    return await this.adminService.getAllCompanies();
  }

  @Post('companies/:companyId/owners/:userId')
  @UseGuards(AdminGuard)
  async assignCompanyOwner(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.adminService.assignCompanyOwner(companyId, userId, req.user);
    return {
      message: 'Company owner assigned successfully',
    };
  }
}
