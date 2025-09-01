import { AuthService } from '@/root/auth/auth.service';
import { GetUser } from '@/root/auth/decorators/get-user.decorator';
import { AuthResponseDto } from '@/root/auth/dto/auth-response.dto';
import { ForgotPasswordDto } from '@/root/auth/dto/forgot-password.dto';
import { LoginDto } from '@/root/auth/dto/login.dto';
import { ResetPasswordDto } from '@/root/auth/dto/reset-password.dto';
import { SignupDto } from '@/root/auth/dto/signup.dto';
import { UpdatePasswordDto } from '@/root/auth/dto/update-password.dto';
import { JwtAuthGuard } from '@/root/auth/guards/jwt-auth.guard';
import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email already in use' })
  signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset token generated' })
  @ApiResponse({ status: 400, description: 'User not found' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Patch('update-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updatePassword(@GetUser() user: any, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(user.id, dto);
  }
}
