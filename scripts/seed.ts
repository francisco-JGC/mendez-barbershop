import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { UserOrmEntity } from '../src/modules/users/infrastructure/persistence/user.orm-entity';
import { BarbershopOrmEntity } from '../src/modules/tenants/infrastructure/persistence/barbershop.orm-entity';
import { Role } from '../src/common/constants/role.enum';

function required(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

// After Escenario A there's a single admin role — the "jefe" — which is a
// user with barbershopId=null that manages all branches from the header
// switcher. This script bootstraps that admin plus an initial branch.
async function run() {
  const adminEmail = required('ADMIN_EMAIL', process.env.ADMIN_EMAIL);
  const adminPassword = required('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD);
  const adminName = process.env.ADMIN_NAME ?? 'Admin';

  const tenantCode = required(
    'ADMIN_TENANT_CODE',
    process.env.ADMIN_TENANT_CODE,
  ).toLowerCase();
  const tenantName =
    process.env.ADMIN_TENANT_NAME ??
    tenantCode.charAt(0).toUpperCase() + tenantCode.slice(1);

  await AppDataSource.initialize();
  const barbershopRepo = AppDataSource.getRepository(BarbershopOrmEntity);
  const userRepo = AppDataSource.getRepository(UserOrmEntity);

  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail, barbershopId: IsNull() },
  });
  if (existingAdmin) {
    console.log(`↷ Admin already exists: ${adminEmail}`);
  } else {
    await userRepo.save(
      userRepo.create({
        barbershopId: null,
        name: adminName,
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: Role.ADMIN,
      }),
    );
    console.log(`✓ Admin created: ${adminEmail}`);
  }

  const barbershop = await barbershopRepo.findOne({ where: { code: tenantCode } });
  if (barbershop) {
    console.log(`↷ Barbershop already exists: "${barbershop.name}" (${tenantCode})`);
  } else {
    const created = await barbershopRepo.save(
      barbershopRepo.create({ code: tenantCode, name: tenantName }),
    );
    console.log(`✓ Barbershop created: "${created.name}" (${tenantCode})`);
  }

  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
