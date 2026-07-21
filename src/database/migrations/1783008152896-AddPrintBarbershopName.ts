import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrintBarbershopName1783008152896 implements MigrationInterface {
  name = 'AddPrintBarbershopName1783008152896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "barbershop_settings" ADD "printBarbershopName" boolean NOT NULL DEFAULT true`,
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
      `ALTER TABLE "barbershop_settings" DROP COLUMN "printBarbershopName"`,
    );
  }
}
