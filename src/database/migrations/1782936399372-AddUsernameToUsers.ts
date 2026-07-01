import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsernameToUsers1782936399372 implements MigrationInterface {
    name = 'AddUsernameToUsers1782936399372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_969bb86a88986f8faed05bce13"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5c54fe991f0063fe84a2fd8ed6" ON "users"  ("barbershopId", "username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_969bb86a88986f8faed05bce13" ON "users"  ("barbershopId", "email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_969bb86a88986f8faed05bce13"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5c54fe991f0063fe84a2fd8ed6"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_969bb86a88986f8faed05bce13" ON "users" USING btree ("barbershopId", "email") `);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
