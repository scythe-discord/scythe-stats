import { MigrationInterface, QueryRunner } from 'typeorm';

const OFFICIAL_PLAYER_MATS_IN_ORDER = [
  'Industrial',
  'Engineering',
  'Militant',
  'Patriotic',
  'Innovative',
  'Mechanical',
  'Agricultural',
];

export class PlayerMatOrder1663010955002 implements MigrationInterface {
  name = 'PlayerMatOrder1663010955002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player_mat" ADD "order" integer`);

    await queryRunner.query(
      `UPDATE "player_mat" SET "order" = (CASE ${OFFICIAL_PLAYER_MATS_IN_ORDER.map(
        (matName, idx) => `WHEN "name" = '${matName}' THEN ${idx + 1}`
      ).join(' ')} END)`
    );

    await queryRunner.query(
      `ALTER TABLE "player_mat" ALTER COLUMN "order" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "player_mat" ADD CONSTRAINT "UQ_72f9b8703be535cbb37795c3db2" UNIQUE ("order")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_mat" DROP CONSTRAINT "UQ_72f9b8703be535cbb37795c3db2"`
    );
    await queryRunner.query(`ALTER TABLE "player_mat" DROP COLUMN "order"`);
  }
}
