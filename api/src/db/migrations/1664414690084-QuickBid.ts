import {MigrationInterface, QueryRunner} from "typeorm";

export class QuickBid1664414690084 implements MigrationInterface {
    name = 'QuickBid1664414690084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "quickBid" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD "quickBids" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP COLUMN "quickBids"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "quickBid"`);
    }

}
