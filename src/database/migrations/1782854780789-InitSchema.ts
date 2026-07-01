import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1782854780789 implements MigrationInterface {
  name = 'InitSchema1782854780789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barbershopId" uuid NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "lowStockThreshold" integer NOT NULL DEFAULT '3', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_281cee70e8ea8317a9ee003fa6" ON "products"  ("barbershopId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barbershopId" uuid NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef15f3532247aa56e41070fd9f" ON "services"  ("barbershopId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barbershopId" uuid NOT NULL, "barberId" uuid NOT NULL, "stationId" uuid, "total" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fc68e36e8666b1e471da4883dd" ON "tickets"  ("barbershopId", "barberId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_270a49e623cb2a8a79e70abd7b" ON "tickets"  ("barbershopId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ticket_items_itemtype_enum" AS ENUM('service', 'product')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticketId" uuid NOT NULL, "itemType" "public"."ticket_items_itemtype_enum" NOT NULL, "itemId" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "unitPrice" numeric(10,2) NOT NULL, "subtotal" numeric(10,2) NOT NULL, CONSTRAINT "PK_42c1d9799d0b98de1654a97ef1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stations_status_enum" AS ENUM('available', 'occupied')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barbershopId" uuid NOT NULL, "number" integer NOT NULL, "status" "public"."stations_status_enum" NOT NULL DEFAULT 'available', "currentBarberId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f047974bd453c85b08bab349367" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d87944ce7e9cb0f2b03c899174" ON "stations"  ("barbershopId", "number") `,
    );
    await queryRunner.query(
      `CREATE TABLE "barbershops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "subdomain" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6da853d8fa59f0f97114c30e5b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a41aa2518864b8f6c58b0cdff9" ON "barbershops"  ("subdomain") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'barber')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barbershopId" uuid, "name" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'barber', "isActive" boolean NOT NULL DEFAULT true, "currentRefreshTokenHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_969bb86a88986f8faed05bce13" ON "users"  ("barbershopId", "email") `,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_items" ADD CONSTRAINT "FK_d229a0672a063c7eaa64720cd6a" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ticket_items" DROP CONSTRAINT "FK_d229a0672a063c7eaa64720cd6a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_969bb86a88986f8faed05bce13"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a41aa2518864b8f6c58b0cdff9"`,
    );
    await queryRunner.query(`DROP TABLE "barbershops"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d87944ce7e9cb0f2b03c899174"`,
    );
    await queryRunner.query(`DROP TABLE "stations"`);
    await queryRunner.query(`DROP TYPE "public"."stations_status_enum"`);
    await queryRunner.query(`DROP TABLE "ticket_items"`);
    await queryRunner.query(`DROP TYPE "public"."ticket_items_itemtype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_270a49e623cb2a8a79e70abd7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc68e36e8666b1e471da4883dd"`,
    );
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ef15f3532247aa56e41070fd9f"`,
    );
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_281cee70e8ea8317a9ee003fa6"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
