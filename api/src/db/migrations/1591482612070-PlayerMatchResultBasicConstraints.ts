import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlayerMatchResultBasicConstraints1591482612070
  implements MigrationInterface {
  name = 'PlayerMatchResultBasicConstraints1591482612070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD CONSTRAINT "UQ_a63d229c5596d702ecd6f7e9076" UNIQUE ("matchId", "coins", "tieOrder")`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD CONSTRAINT "UQ_463fe2bee921b6a3f41b926b78f" UNIQUE ("matchId", "playerId")`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD CONSTRAINT "UQ_a3143fb2b454409264cc6f979d6" UNIQUE ("matchId", "playerMatId")`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" ADD CONSTRAINT "UQ_737e86794c7ae3159b495bbb8c0" UNIQUE ("matchId", "factionId")`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP CONSTRAINT "UQ_737e86794c7ae3159b495bbb8c0"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP CONSTRAINT "UQ_a3143fb2b454409264cc6f979d6"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP CONSTRAINT "UQ_463fe2bee921b6a3f41b926b78f"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "player_match_result" DROP CONSTRAINT "UQ_a63d229c5596d702ecd6f7e9076"`,
      undefined
    );
  }
}
