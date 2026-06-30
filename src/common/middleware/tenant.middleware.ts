import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import {
  BARBERSHOP_REPOSITORY,
  IBarbershopRepository,
} from '../../modules/tenants/domain/barbershop.repository';

declare module 'express' {
  interface Request {
    tenantId: string | null;
    tenantSubdomain: string | null;
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly baseDomain: string;

  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
    private readonly configService: ConfigService,
  ) {
    this.baseDomain = this.configService.get<string>('BASE_DOMAIN')!;
  }

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const host = (req.headers.host ?? '').split(':')[0].toLowerCase();

    if (host === this.baseDomain || host === `www.${this.baseDomain}`) {
      req.tenantId = null;
      req.tenantSubdomain = null;
      return next();
    }

    const suffix = `.${this.baseDomain}`;
    if (!host.endsWith(suffix)) {
      throw new BadRequestException('Unknown host');
    }

    const subdomain = host.slice(0, -suffix.length);
    const barbershop = await this.barbershopRepository.findBySubdomain(
      subdomain,
    );

    if (!barbershop || !barbershop.isActive) {
      throw new NotFoundException('Barbershop not found');
    }

    req.tenantId = barbershop.id;
    req.tenantSubdomain = subdomain;
    next();
  }
}
