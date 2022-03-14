import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameEnabledCombos1663000533469 implements MigrationInterface {
    name = 'BidGameEnabledCombos1663000533469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP COLUMN "selected"`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "enabledCombos" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "enabledCombos"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD "selected" boolean NOT NULL DEFAULT false`);
    }

}
