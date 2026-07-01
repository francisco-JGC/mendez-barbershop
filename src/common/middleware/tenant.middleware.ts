import {
  Inject,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { BARBERSHOP_REPOSITORY } from '../../modules/tenants/domain/barbershop.repository';
import type { IBarbershopRepository } from '../../modules/tenants/domain/barbershop.repository';

export const TENANT_CODE_HEADER = 'x-tenant-code';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(BARBERSHOP_REPOSITORY)
    private readonly barbershopRepository: IBarbershopRepository,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const header = req.headers[TENANT_CODE_HEADER];
    const code = Array.isArray(header) ? header[0] : header;

    if (!code) {
      // No establishment code sent: super_admin context.
      req.tenantId = null;
      return next();
    }

    const barbershop = await this.barbershopRepository.findByCode(
      code.toLowerCase(),
    );

    if (!barbershop || !barbershop.isActive) {
      throw new NotFoundException('Establishment not found');
    }

    req.tenantId = barbershop.id;
    next();
  }
}
