import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../application/ports/token.service';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    // JWT_ACCESS_SECRET is required at boot; startup will fail elsewhere if
    // it's missing. The `!` is safe because we can't recover from a missing
    // secret anyway.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const secret = configService.get<string>('JWT_ACCESS_SECRET')!;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      username: payload.username,
      role: payload.role,
      barbershopId: payload.barbershopId,
      barbershopName: payload.barbershopName,
    };
  }
}
