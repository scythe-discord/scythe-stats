import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameComboSelected1662939020585 implements MigrationInterface {
    name = 'BidGameComboSelected1662939020585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD "selected" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP COLUMN "selected"`);
    }

}
