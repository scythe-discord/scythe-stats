import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlayerMatchResultTieOrder1591338376020
  implements MigrationInterface {
  name = 'PlayerMatchResultTieOrder1591338376020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD "tieOrder" integer NOT NULL DEFAULT 0`,
      undefined
    );

    const playerMatchResults = await queryRunner.query(
      `SELECT * FROM player_match_result`
    );

    const matchToResults: { [key: string]: any[] } = {};

    playerMatchResults.forEach((result: any) => {
      if (!matchToResults[result.matchId]) {
        matchToResults[result.matchId] = [];
      }

      matchToResults[result.matchId].push(result);
    });

    Object.keys(matchToResults).forEach((matchId) => {
      const orderedMatchResults = [...matchToResults[matchId]].sort((a, b) => {
        if (a.coins < b.coins) {
          return 1;
        } else if (a.coins === b.coins && a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      });

      let prevResult: any = null;
      orderedMatchResults.forEach(async (result) => {
        if (prevResult !== null && prevResult.coins === result.coins) {
          result.tieOrder = prevResult.tieOrder + 1;
          await queryRunner.query(
            `UPDATE player_match_result SET "tieOrder"=${result.tieOrder} WHERE id=${result.id}`
          );
        }
        prevResult = result;
      });
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP COLUMN "tieOrder"`,
      undefined
    );
  }
}
