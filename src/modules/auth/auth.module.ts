import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TOKEN_SERVICE } from './application/ports/token.service';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './infrastructure/http/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

@Module({
  imports: [UsersModule, TenantsModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    JwtStrategy,
    LoginUseCase,
    RefreshTokenUseCase,
  ],
})
export class AuthModule {}
