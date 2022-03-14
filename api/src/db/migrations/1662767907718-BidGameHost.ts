import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameHost1662767907718 implements MigrationInterface {
    name = 'BidGameHost1662767907718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "hostId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD CONSTRAINT "UQ_3b59f7fb6a0e4c661946d24fd2c" UNIQUE ("hostId")`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD CONSTRAINT "FK_3b59f7fb6a0e4c661946d24fd2c" FOREIGN KEY ("hostId") REFERENCES "bid_game_player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" DROP CONSTRAINT "FK_3b59f7fb6a0e4c661946d24fd2c"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP CONSTRAINT "UQ_3b59f7fb6a0e4c661946d24fd2c"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "hostId"`);
    }

}
