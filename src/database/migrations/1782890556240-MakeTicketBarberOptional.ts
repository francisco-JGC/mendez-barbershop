import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeTicketBarberOptional1782890556240 implements MigrationInterface {
    name = 'MakeTicketBarberOptional1782890556240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fc68e36e8666b1e471da4883dd"`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "barberId" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_fc68e36e8666b1e471da4883dd" ON "tickets"  ("barbershopId", "barberId", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fc68e36e8666b1e471da4883dd"`);
        await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "barberId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_fc68e36e8666b1e471da4883dd" ON "tickets" USING btree ("barberId", "barbershopId", "createdAt") `);
    }

}
