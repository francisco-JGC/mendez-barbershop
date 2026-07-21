import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { UserOrmEntity } from '../src/modules/users/infrastructure/persistence/user.orm-entity';
import { Role } from '../src/common/constants/role.enum';

type AdminInput = {
  email: string;
  password: string;
  name?: string;
};

function required(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

/**
 * Bulk-creates admin users. All admins are global (barbershopId=null) — they
 * manage every branch via the header switcher (Escenario A).
 *
 * Reads from either:
 *   - `ADMINS='[{"email":"...","password":"...","name":"..."}]'` for bulk
 *   - `ADMIN_EMAIL` + `ADMIN_PASSWORD` + `ADMIN_NAME` for a single admin
 *
 * Kept `SUPER_ADMIN_*` and `SUPER_ADMINS` as legacy fallbacks so existing
 * `.env` files don't break during the migration.
 */
function parseAdmins(): AdminInput[] {
  const raw = process.env.ADMINS ?? process.env.SUPER_ADMINS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AdminInput[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.error('ADMINS must be a non-empty JSON array');
        process.exit(1);
      }
      parsed.forEach((item, index) => {
        if (!item.email || !item.password) {
          console.error(`ADMINS[${index}] must include "email" and "password"`);
          process.exit(1);
        }
      });
      return parsed;
    } catch (error) {
      console.error('ADMINS is not valid JSON:', (error as Error).message);
      process.exit(1);
    }
  }

  const email = process.env.ADMIN_EMAIL ?? process.env.SUPER_ADMIN_EMAIL;
  const password =
    process.env.ADMIN_PASSWORD ?? process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? process.env.SUPER_ADMIN_NAME;

  return [
    {
      email: required('ADMIN_EMAIL (or SUPER_ADMIN_EMAIL)', email),
      password: required('ADMIN_PASSWORD (or SUPER_ADMIN_PASSWORD)', password),
      name,
    },
  ];
}

async function run() {
  const admins = parseAdmins();

  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserOrmEntity);

  for (const input of admins) {
    const email = input.email.trim().toLowerCase();
    const name = input.name?.trim() || 'Admin';

    const existing = await userRepo.findOne({
      where: { email, barbershopId: IsNull() },
    });

    if (existing) {
      console.log(`↷ Admin already exists: ${email}`);
      continue;
    }

    await userRepo.save(
      userRepo.create({
        barbershopId: null,
        name,
        email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: Role.ADMIN,
      }),
    );
    console.log(`✓ Admin created: ${email}`);
  }

  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
