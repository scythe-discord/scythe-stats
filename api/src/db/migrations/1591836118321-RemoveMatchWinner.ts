import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMatchWinner1591836118321 implements MigrationInterface {
  name = 'RemoveMatchWinner1591836118321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "match" DROP CONSTRAINT "FK_367ddf891f920aae1b667353193"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "match" DROP CONSTRAINT "UQ_367ddf891f920aae1b667353193"`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "match" DROP COLUMN "winnerId"`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "match" ADD "winnerId" integer`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "UQ_367ddf891f920aae1b667353193" UNIQUE ("winnerId")`,
      undefined
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_367ddf891f920aae1b667353193" FOREIGN KEY ("winnerId") REFERENCES "player_match_result"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined
    );
  }
}
