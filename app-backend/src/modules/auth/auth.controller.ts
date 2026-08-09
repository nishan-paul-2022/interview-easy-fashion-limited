import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Ip,
  Headers,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/auth.service';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { CreateUserDto } from '@/modules/auth/dto/create-user.dto';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { VerifyEmailDto } from '@/modules/auth/dto/verify-email.dto';
import { FacebookOauthGuard } from '@/modules/auth/guards/facebook-oauth.guard';
import { GoogleOauthGuard } from '@/modules/auth/guards/google-oauth.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '@/modules/auth/guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account is inactive' })
  @ApiResponse({ status: 429, description: 'Account locked' })
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') userAgent: string) {
    return this.authService.login(dto, ip, userAgent);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@CurrentUser() user: { id: string; refreshToken: string }) {
    return this.authService.refresh(user.id, user.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: { id: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.authService.logout(user.id, ip, userAgent);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth() {
    // Passport redirects automatically
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const frontendUrl =
      this.configService.get<string>('CORS_ORIGIN_CUSTOMER') || 'http://localhost:3013';
    try {
      const result = await this.authService.googleLogin(
        req.user as { providerId: string; email: string; fullName: string },
        ip,
        userAgent,
      );
      return res.redirect(
        `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
      );
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 403 || err.message === 'Account is inactive') {
        return res.redirect(`${frontendUrl}/login?error=inactive`);
      }
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }

  @Get('facebook')
  @UseGuards(FacebookOauthGuard)
  @ApiOperation({ summary: 'Initiate Facebook OAuth flow' })
  async facebookAuth() {
    // Passport redirects automatically
  }

  @Get('facebook/callback')
  @UseGuards(FacebookOauthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const frontendUrl =
      this.configService.get<string>('CORS_ORIGIN_CUSTOMER') || 'http://localhost:3013';
    try {
      const result = await this.authService.facebookLogin(
        req.user as { providerId: string; email: string; fullName: string },
        ip,
        userAgent,
      );
      return res.redirect(
        `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
      );
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 403 || err.message === 'Account is inactive') {
        return res.redirect(`${frontendUrl}/login?error=inactive`);
      }
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email')
  verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(@CurrentUser() payload: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(payload.id, dto);
  }
}
