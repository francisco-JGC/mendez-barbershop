import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `supervisor` to the users_role_enum. Supervisors are branch-scoped
 * users (like barbers/sellers, they carry a barbershopId) that can manage
 * everything inside their own branch — products, services, stations,
 * settings, and creating barbers/sellers — but cannot see other branches
 * nor create other supervisors or admins. They log in with username +
 * branch code, just like barbers and sellers.
 *
 * Uses the standard rename-recreate-alter-drop pattern because Postgres
 * won't ALTER TYPE ADD VALUE inside a transaction.
 */
export class AddSupervisorRole1786000000000 implements MigrationInterface {
  name = 'AddSupervisorRole1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'supervisor', 'barber', 'seller')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::text::"public"."users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'barber'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Anyone who was created as supervisor becomes an admin on rollback —
    // preserves branch access (they'll be global then, which is a superset).
    // If you really want to undo you should manually reassign afterwards.
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'admin' WHERE "role" = 'supervisor'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'barber', 'seller')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::text::"public"."users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'barber'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
  }
}
