import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Escenario A (2026-07): eliminar el rol super_admin. Todos los admins pasan
 * a operar sin `barbershopId` (multi-sucursal) — un solo tipo de admin que
 * ve y gestiona todas las sucursales desde el panel del web.
 *
 * Pasos:
 *   1. Reasignar todos los super_admin → admin.
 *   2. Setear barbershopId = NULL a todos los admins (para que vean todas).
 *   3. Recrear el enum users_role_enum quitando 'super_admin'.
 *
 * El paso 3 sigue el patrón "rename → create new → alter column → drop old"
 * porque Postgres no permite ALTER TYPE DROP VALUE dentro de una transacción.
 */
export class RemoveSuperAdminRole1785000000000 implements MigrationInterface {
  name = 'RemoveSuperAdminRole1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'admin' WHERE "role" = 'super_admin'`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "barbershopId" = NULL WHERE "role" = 'admin'`,
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add super_admin to the enum but there's no safe way to know which
    // admins were originally super_admins — leave them as admin so the app
    // still boots. Reassign them manually if a rollback is really needed.
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'barber', 'seller')`,
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
