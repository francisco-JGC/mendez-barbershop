import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBarbershopSettings1782950534568 implements MigrationInterface {
  name = 'CreateBarbershopSettings1782950534568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "barbershop_settings" ("barbershopId" uuid NOT NULL, "commissionRate" numeric(5,4) NOT NULL DEFAULT '0.5', "receiptFooter" character varying(200) NOT NULL DEFAULT 'Gracias por su visita', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_11d68be2f570f4aa8da1aa93235" PRIMARY KEY ("barbershopId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "barbershop_settings"`);
  }
}
