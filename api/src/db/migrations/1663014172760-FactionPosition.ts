import { MigrationInterface, QueryRunner } from 'typeorm';

const OFFICIAL_FACTIONS_IN_ORDER = [
  'Polania',
  'Albion',
  'Nordic',
  'Rusviet',
  'Togawa',
  'Crimean',
  'Saxony',
];

export class FactionPosition1663014172760 implements MigrationInterface {
  name = 'FactionPosition1663014172760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "faction" ADD "position" integer`);
    await queryRunner.query(
      `UPDATE "faction" SET "position" = (CASE ${OFFICIAL_FACTIONS_IN_ORDER.map(
        (faction, idx) => `WHEN "name" = '${faction}' THEN ${idx + 1}`
      ).join(' ')} END)`
    );

    await queryRunner.query(
      `ALTER TABLE "faction" ALTER COLUMN "position" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "faction" ADD CONSTRAINT "UQ_b1fd0e445bb2a73397e874492fc" UNIQUE ("position")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "faction" DROP CONSTRAINT "UQ_b1fd0e445bb2a73397e874492fc"`
    );
    await queryRunner.query(`ALTER TABLE "faction" DROP COLUMN "position"`);
  }
}
