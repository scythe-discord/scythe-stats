import { MigrationInterface, QueryRunner } from 'typeorm';

const OFFICIAL_PLAYER_MATS = [
  'Industrial',
  'Engineering',
  'Patriotic',
  'Mechanical',
  'Agricultural',
  'Militant',
  'Innovative'
];

export class PlayerMat1579851571966 implements MigrationInterface {
  name = 'PlayerMat1579851571966';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "player_mat" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_e609287fd07431532768faa6aa6" UNIQUE ("name"), CONSTRAINT "PK_e3f066bd824539623b5f4393707" PRIMARY KEY ("id"))`,
      undefined
    );

    const playerMatValues = OFFICIAL_PLAYER_MATS.map(
      name => `('${name}')`
    ).join(',');

    await queryRunner.query(
      `INSERT INTO player_mat (name) VALUES ${playerMatValues};`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "player_mat"`, undefined);
  }
}
