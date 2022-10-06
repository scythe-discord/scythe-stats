import {MigrationInterface, QueryRunner} from "typeorm";

export class RankedAndTrueskillChange1664607882290 implements MigrationInterface {
    name = 'RankedAndTrueskillChange1664607882290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_match_result" ADD "playerTrueskill" jsonb`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "ranked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" DROP CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98"`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "sigma" SET DEFAULT '8.333333333333334'`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ADD CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_trueskill" DROP CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98"`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "sigma" SET DEFAULT 8.333333333333333`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ADD CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "ranked"`);
        await queryRunner.query(`ALTER TABLE "player_match_result" DROP COLUMN "playerTrueskill"`);
    }

}
