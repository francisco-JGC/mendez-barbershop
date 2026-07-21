import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Barbers/sellers reported login failures when their username differed by
 * casing (e.g. stored as "Juan.Perez" but they typed "juan.perez"). Going
 * forward create-user normalizes both fields, and login lookups are already
 * case-insensitive. This one-time migration back-fills the existing rows.
 *
 * Uses TRIM + LOWER to also collapse any stray whitespace that snuck in.
 */
export class LowercaseUserIdentifiers1785500000000
  implements MigrationInterface
{
  name = 'LowercaseUserIdentifiers1785500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "users" SET "email" = LOWER(TRIM("email")) WHERE "email" IS NOT NULL AND "email" <> LOWER(TRIM("email"))`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "username" = LOWER(TRIM("username")) WHERE "username" IS NOT NULL AND "username" <> LOWER(TRIM("username"))`,
    );
  }

  public async down(): Promise<void> {
    // No-op: we can't restore the original casing without external data.
  }
}
