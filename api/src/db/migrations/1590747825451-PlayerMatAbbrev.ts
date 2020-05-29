import { MigrationInterface, QueryRunner } from 'typeorm';

const PLAYER_MAT_ABBREVIATIONS: { [key: string]: string } = {
  Industrial: 'Ind',
  Engineering: 'Eng',
  Patriotic: 'Pat',
  Mechanical: 'Mech',
  Agricultural: 'Agri',
  Militant: 'Mil',
  Innovative: 'Inno',
};

export class PlayerMatAbbrev1590747825451 implements MigrationInterface {
  name = 'PlayerMatAbbrev1590747825451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_mat" ADD "abbrev" character varying`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_mat" ADD CONSTRAINT "UQ_1cb35a4fa3cd2c9afa0c897a035" UNIQUE ("abbrev")`,
      undefined
    );

    const playerMats = await queryRunner.query(
      `SELECT id, name FROM player_mat`
    );

    playerMats.forEach(async ({ id, name }: { id: number; name: string }) => {
      const abbrev = PLAYER_MAT_ABBREVIATIONS[name];

      if (!abbrev) {
        throw new Error(
          `Could not find an abbreviation for player mat ${name}`
        );
      }

      await queryRunner.query(
        `UPDATE "player_mat" SET abbrev='${abbrev}' WHERE id=${id}`
      );
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_mat" DROP CONSTRAINT "UQ_1cb35a4fa3cd2c9afa0c897a035"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_mat" DROP COLUMN "abbrev"`,
      undefined
    );
  }
}
