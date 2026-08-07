import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAccessStrategy } from '@/modules/auth/strategies/jwt-access.strategy';
import { TokenService } from '@/modules/auth/token.service';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtAccessStrategy],
})
export class AuthModule {}
