import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Safety net: any user with `role = 'admin'` and a non-null `barbershopId`
 * is a leftover from before Escenario A, or from the `create-barbershop-
 * admin` flow that (until the fix in this same PR) was still pinning admins
 * to a branch. The invariant post-Escenario-A is that every admin is global
 * (`barbershopId = null`) so they can switch branches from the header.
 *
 * Idempotent: only touches rows where the invariant is violated.
 */
export class NormalizeAdminBarbershopIds1785600000000
  implements MigrationInterface
{
  name = 'NormalizeAdminBarbershopIds1785600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "users" SET "barbershopId" = NULL WHERE "role" = 'admin' AND "barbershopId" IS NOT NULL`,
    );
  }

  public async down(): Promise<void> {
    // No-op: we can't reconstruct which branch each admin used to belong to
    // without external data, and the whole point of Escenario A is that they
    // don't belong to one.
  }
}
