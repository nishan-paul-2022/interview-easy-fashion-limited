import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthService } from '@/modules/auth/auth.service';
import { CreateUserDto } from '@/modules/auth/dto/create-user.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { FacebookOauthGuard } from '@/modules/auth/guards/facebook-oauth.guard';
import { GoogleOauthGuard } from '@/modules/auth/guards/google-oauth.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '@/modules/auth/guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
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
  async getMe(@CurrentUser() payload: { sub: string }) {
    return this.authService.getMe(payload.sub);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@CurrentUser() payload: { sub: string; refreshToken: string }) {
    return this.authService.refresh(payload.sub, payload.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() payload: { sub: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.authService.logout(payload.sub, ip, userAgent);
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
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.googleLogin(
      req.user as { providerId: string; email: string; fullName: string },
      ip,
      userAgent,
    );
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
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.facebookLogin(
      req.user as { providerId: string; email: string; fullName: string },
      ip,
      userAgent,
    );
  }
}
