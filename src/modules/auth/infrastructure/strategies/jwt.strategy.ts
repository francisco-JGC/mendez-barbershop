import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../application/ports/token.service';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
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
