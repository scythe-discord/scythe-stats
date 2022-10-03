import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGamePlayerOrderUnique1663025340984 implements MigrationInterface {
    name = 'BidGamePlayerOrderUnique1663025340984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "UQ_5cc3122a369dd26c7cf226c55ce"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "bid_game_order_unique" UNIQUE ("bidGameId", "order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "bid_game_order_unique"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "UQ_5cc3122a369dd26c7cf226c55ce" UNIQUE ("order")`);
    }

}
