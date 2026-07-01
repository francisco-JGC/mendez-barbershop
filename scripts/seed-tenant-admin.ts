import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../src/database/data-source';
import { UserOrmEntity } from '../src/modules/users/infrastructure/persistence/user.orm-entity';
import { BarbershopOrmEntity } from '../src/modules/tenants/infrastructure/persistence/barbershop.orm-entity';
import { Role } from '../src/common/constants/role.enum';

async function run() {
  const tenantCode = process.argv[2] ?? process.env.ADMIN_TENANT_CODE;
  const email = process.argv[3] ?? process.env.ADMIN_EMAIL;
  const password = process.argv[4] ?? process.env.ADMIN_PASSWORD;
  const name = process.argv[5] ?? process.env.ADMIN_NAME ?? 'Admin';

  if (!tenantCode || !email || !password) {
    console.error(
      'Usage: npm run seed:admin -- <tenantCode> <email> <password> [name]\n' +
        'Or set ADMIN_TENANT_CODE / ADMIN_EMAIL / ADMIN_PASSWORD (/ ADMIN_NAME) in .env',
    );
    process.exit(1);
  }

  await AppDataSource.initialize();
  const barbershopRepo = AppDataSource.getRepository(BarbershopOrmEntity);
  const userRepo = AppDataSource.getRepository(UserOrmEntity);

  const barbershop = await barbershopRepo.findOne({
    where: { code: tenantCode.toLowerCase() },
  });
  if (!barbershop) {
    console.error(`No barbershop found with code "${tenantCode}"`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  const existing = await userRepo.findOne({
    where: { email, barbershopId: barbershop.id },
  });
  if (existing) {
    console.error(`A user with email "${email}" already exists in this tenant`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = userRepo.create({
    barbershopId: barbershop.id,
    name,
    email,
    passwordHash,
    role: Role.ADMIN,
  });
  await userRepo.save(user);

  console.log(`Admin created for "${barbershop.name}" (${tenantCode}): ${email}`);
  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
