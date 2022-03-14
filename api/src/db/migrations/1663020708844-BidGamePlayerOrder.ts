import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGamePlayerOrder1663020708844 implements MigrationInterface {
    name = 'BidGamePlayerOrder1663020708844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "UQ_5cc3122a369dd26c7cf226c55ce" UNIQUE ("order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "UQ_5cc3122a369dd26c7cf226c55ce"`);
    }

}
