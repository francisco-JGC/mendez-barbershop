import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameBarbershopSubdomainToCode1782860368539 implements MigrationInterface {
  name = 'RenameBarbershopSubdomainToCode1782860368539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a41aa2518864b8f6c58b0cdff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershops" RENAME COLUMN "subdomain" TO "code"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_87acf141d0e036ece8c2e5fcc9" ON "barbershops"  ("code") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87acf141d0e036ece8c2e5fcc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershops" RENAME COLUMN "code" TO "subdomain"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a41aa2518864b8f6c58b0cdff9" ON "barbershops" USING btree ("subdomain") `,
    );
  }
}
