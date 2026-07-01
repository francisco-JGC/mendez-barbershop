import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBarcodeToProducts1782941664217 implements MigrationInterface {
    name = 'AddBarcodeToProducts1782941664217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "barcode" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7926a5b74507ef7f4e693fbb13" ON "products"  ("barbershopId", "barcode") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7926a5b74507ef7f4e693fbb13"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "barcode"`);
    }

}
