import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogoToSettings1783005813432 implements MigrationInterface {
  name = 'AddLogoToSettings1783005813432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "barbershop_settings" ADD "logo" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_settings" ALTER COLUMN "commissionRate" SET DEFAULT '0.5'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "barbershop_settings" ALTER COLUMN "commissionRate" SET DEFAULT 0.5`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_settings" DROP COLUMN "logo"`,
    );
  }
}
