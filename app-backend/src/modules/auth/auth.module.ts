import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { FacebookStrategy } from '@/modules/auth/strategies/facebook.strategy';
import { GoogleStrategy } from '@/modules/auth/strategies/google.strategy';
import { JwtAccessStrategy } from '@/modules/auth/strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from '@/modules/auth/strategies/jwt-refresh.strategy';
import { TokenService } from '@/modules/auth/token.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
