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

async function run() {
  const superAdminEmail = required('SUPER_ADMIN_EMAIL', process.env.SUPER_ADMIN_EMAIL);
  const superAdminPassword = required('SUPER_ADMIN_PASSWORD', process.env.SUPER_ADMIN_PASSWORD);
  const superAdminName = process.env.SUPER_ADMIN_NAME ?? 'Super Admin';

  const tenantCode = required('ADMIN_TENANT_CODE', process.env.ADMIN_TENANT_CODE).toLowerCase();
  const tenantName =
    process.env.ADMIN_TENANT_NAME ?? tenantCode.charAt(0).toUpperCase() + tenantCode.slice(1);

  const adminEmail = required('ADMIN_EMAIL', process.env.ADMIN_EMAIL);
  const adminPassword = required('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD);
  const adminName = process.env.ADMIN_NAME ?? 'Admin';

  await AppDataSource.initialize();
  const barbershopRepo = AppDataSource.getRepository(BarbershopOrmEntity);
  const userRepo = AppDataSource.getRepository(UserOrmEntity);

  let superAdmin = await userRepo.findOne({
    where: { email: superAdminEmail, barbershopId: IsNull() },
  });
  if (superAdmin) {
    console.log(`↷ Super admin already exists: ${superAdminEmail}`);
  } else {
    superAdmin = await userRepo.save(
      userRepo.create({
        barbershopId: null,
        name: superAdminName,
        email: superAdminEmail,
        passwordHash: await bcrypt.hash(superAdminPassword, 12),
        role: Role.SUPER_ADMIN,
      }),
    );
    console.log(`✓ Super admin created: ${superAdminEmail}`);
  }

  let barbershop = await barbershopRepo.findOne({ where: { code: tenantCode } });
  if (barbershop) {
    console.log(`↷ Barbershop already exists: "${barbershop.name}" (${tenantCode})`);
  } else {
    barbershop = await barbershopRepo.save(
      barbershopRepo.create({ code: tenantCode, name: tenantName }),
    );
    console.log(`✓ Barbershop created: "${barbershop.name}" (${tenantCode})`);
  }

  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail, barbershopId: barbershop.id },
  });
  if (existingAdmin) {
    console.log(`↷ Tenant admin already exists: ${adminEmail} @ ${tenantCode}`);
  } else {
    await userRepo.save(
      userRepo.create({
        barbershopId: barbershop.id,
        name: adminName,
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: Role.ADMIN,
      }),
    );
    console.log(`✓ Tenant admin created: ${adminEmail} @ ${tenantCode}`);
  }

  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
