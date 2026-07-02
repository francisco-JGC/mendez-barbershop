import { Role } from '../../../../common/constants/role.enum';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: string;
  name: string;
  email: string | null;
  username: string | null;
  role: Role;
  barbershopId: string | null;
  barbershopName: string | null;
}

export interface ITokenService {
  signAccessToken(payload: TokenPayload): string;
  signRefreshToken(payload: TokenPayload): string;
  verifyRefreshToken(token: string): TokenPayload;
}
