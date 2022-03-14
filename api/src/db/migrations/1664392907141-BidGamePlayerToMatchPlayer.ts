import { MigrationInterface, QueryRunner } from 'typeorm';

type PlayerMatchResult = {
  id: number;
  tieOrder: number;
  coins: number;
  matchId: number;
};

export class BidGamePlayerToMatchPlayer1664392907141
  implements MigrationInterface
{
  name = 'BidGamePlayerToMatchPlayer1664392907141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP CONSTRAINT "UQ_a63d229c5596d702ecd6f7e9076"`
    );

    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD "rank" integer`
    );
    const playerMatchResults: Array<PlayerMatchResult> =
      await queryRunner.query(
        `SELECT "id", "tieOrder", "coins", "matchId" FROM "player_match_result"`
      );

    const groupedByMatchId: Record<number, Array<PlayerMatchResult>> = {};

    playerMatchResults.forEach((playerMatchResult) => {
      if (!groupedByMatchId[playerMatchResult.matchId]) {
        groupedByMatchId[playerMatchResult.matchId] = [];
      }
      groupedByMatchId[playerMatchResult.matchId].push(playerMatchResult);
    });

    const idRankObjs = Object.values(groupedByMatchId).flatMap((matchResults) =>
      matchResults
        .sort((a, b) => {
          if (a.coins < b.coins) {
            return 1;
          } else if (a.coins === b.coins && a.tieOrder > b.tieOrder) {
            return 1;
          } else {
            return -1;
          }
        })
        .map(({ id }, idx) => ({
          id,
          rank: idx + 1,
        }))
    );

    await queryRunner.query(
      `UPDATE "player_match_result" AS "pmr" SET "rank" = c.rank FROM (values ${idRankObjs
        .map(({ id, rank }) => `(${id}, ${rank})`)
        .join(', ')}) AS c(id, rank) WHERE c.id = pmr.id;`
    );

    await queryRunner.query(
      `ALTER TABLE "player_match_result" ALTER COLUMN "rank" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "bid_game_player" ADD "playerMatchResultId" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_game_player" ADD CONSTRAINT "UQ_73727c7502730c8bd9880a90a1f" UNIQUE ("playerMatchResultId")`
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD CONSTRAINT "UQ_36224eb0f6acea04bc576d38ac0" UNIQUE ("matchId", "rank")`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_73727c7502730c8bd9880a90a1f" FOREIGN KEY ("playerMatchResultId") REFERENCES "player_match_result"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_73727c7502730c8bd9880a90a1f"`
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP CONSTRAINT "UQ_36224eb0f6acea04bc576d38ac0"`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_game_player" DROP CONSTRAINT "UQ_73727c7502730c8bd9880a90a1f"`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_game_player" DROP COLUMN "playerMatchResultId"`
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP COLUMN "rank"`
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD CONSTRAINT "UQ_a63d229c5596d702ecd6f7e9076" UNIQUE ("coins", "matchId", "tieOrder")`
    );
  }
}
