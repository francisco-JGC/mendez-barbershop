import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { UserOrmEntity } from '../src/modules/users/infrastructure/persistence/user.orm-entity';
import { Role } from '../src/common/constants/role.enum';

async function run() {
  const email = process.argv[2] ?? process.env.SUPER_ADMIN_EMAIL;
  const password = process.argv[3] ?? process.env.SUPER_ADMIN_PASSWORD;
  const name = process.argv[4] ?? process.env.SUPER_ADMIN_NAME ?? 'Super Admin';

  if (!email || !password) {
    console.error(
      'Usage: npm run seed:super-admin -- <email> <password> [name]\n' +
        'Or set SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD (/ SUPER_ADMIN_NAME) in .env',
    );
    process.exit(1);
  }

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(UserOrmEntity);

  const existing = await repo.findOne({
    where: { email, barbershopId: IsNull() },
  });
  if (existing) {
    console.error('A user with this email already exists at the top level');
    await AppDataSource.destroy();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = repo.create({
    barbershopId: null,
    name,
    email,
    passwordHash,
    role: Role.SUPER_ADMIN,
  });
  await repo.save(user);

  console.log(`Super admin created: ${email}`);
  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
