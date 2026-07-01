import { MigrationInterface, QueryRunner } from 'typeorm';

// Legacy columns were `timestamp without time zone` but rows were written by
// `now()` while the DB session was in UTC. So the stored naive values already
// represent UTC — we tell Postgres that explicitly with `AT TIME ZONE 'UTC'`
// when widening the column, preserving every existing row's actual instant.
const TABLES: Array<{ table: string; columns: string[] }> = [
  { table: 'products', columns: ['createdAt', 'updatedAt'] },
  { table: 'services', columns: ['createdAt', 'updatedAt'] },
  { table: 'tickets', columns: ['createdAt'] },
  { table: 'stations', columns: ['createdAt', 'updatedAt'] },
  { table: 'barbershops', columns: ['createdAt', 'updatedAt'] },
  { table: 'users', columns: ['createdAt', 'updatedAt'] },
];

export class DatesToTimestamptz1782932393184 implements MigrationInterface {
  name = 'DatesToTimestamptz1782932393184';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { table, columns } of TABLES) {
      for (const column of columns) {
        await queryRunner.query(
          `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITH TIME ZONE USING "${column}" AT TIME ZONE 'UTC'`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { table, columns } of TABLES) {
      for (const column of columns) {
        await queryRunner.query(
          `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITHOUT TIME ZONE USING "${column}" AT TIME ZONE 'UTC'`,
        );
      }
    }
  }
}
