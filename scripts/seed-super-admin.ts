import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { UserOrmEntity } from '../src/modules/users/infrastructure/persistence/user.orm-entity';
import { Role } from '../src/common/constants/role.enum';

type SuperAdminInput = {
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

function parseSuperAdmins(): SuperAdminInput[] {
  const raw = process.env.SUPER_ADMINS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SuperAdminInput[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.error('SUPER_ADMINS must be a non-empty JSON array');
        process.exit(1);
      }
      parsed.forEach((item, index) => {
        if (!item.email || !item.password) {
          console.error(`SUPER_ADMINS[${index}] must include "email" and "password"`);
          process.exit(1);
        }
      });
      return parsed;
    } catch (error) {
      console.error('SUPER_ADMINS is not valid JSON:', (error as Error).message);
      process.exit(1);
    }
  }

  return [
    {
      email: required('SUPER_ADMIN_EMAIL', process.env.SUPER_ADMIN_EMAIL),
      password: required('SUPER_ADMIN_PASSWORD', process.env.SUPER_ADMIN_PASSWORD),
      name: process.env.SUPER_ADMIN_NAME,
    },
  ];
}

async function run() {
  const superAdmins = parseSuperAdmins();

  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserOrmEntity);

  for (const input of superAdmins) {
    const email = input.email.trim().toLowerCase();
    const name = input.name?.trim() || 'Super Admin';

    const existing = await userRepo.findOne({
      where: { email, barbershopId: IsNull() },
    });

    if (existing) {
      console.log(`↷ Super admin already exists: ${email}`);
      continue;
    }

    await userRepo.save(
      userRepo.create({
        barbershopId: null,
        name,
        email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: Role.SUPER_ADMIN,
      }),
    );
    console.log(`✓ Super admin created: ${email}`);
  }

  await AppDataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
