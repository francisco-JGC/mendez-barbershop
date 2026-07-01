import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/user.repository';
import type { IUserRepository } from '../../../users/domain/user.repository';
import { PASSWORD_HASHER } from '../../../users/domain/password-hasher';
import type { IPasswordHasher } from '../../../users/domain/password-hasher';
import { TOKEN_SERVICE } from '../ports/token.service';
import type { ITokenService } from '../ports/token.service';
import { LoginDto } from '../dto/login.dto';
import { AuthTokensResult } from '../auth-tokens.result';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(
    tenantId: string | null,
    dto: LoginDto,
  ): Promise<AuthTokensResult> {
    const user = await this.userRepository.findByIdentifier(
      tenantId,
      dto.identifier,
    );
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      barbershopId: user.barbershopId,
    };

    const accessToken = this.tokenService.signAccessToken(payload);
    const refreshToken = this.tokenService.signRefreshToken(payload);

    user.currentRefreshTokenHash = await this.passwordHasher.hash(refreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }
}
