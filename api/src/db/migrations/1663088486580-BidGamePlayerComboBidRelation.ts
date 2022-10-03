import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGamePlayerComboBidRelation1663088486580 implements MigrationInterface {
    name = 'BidGamePlayerComboBidRelation1663088486580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_d1307cae847c64eae9f82500e01"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "FK_36d76b3bfbc25b38cbdee697f8b"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "UQ_d1307cae847c64eae9f82500e01"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP COLUMN "bidId"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "UQ_36d76b3bfbc25b38cbdee697f8b"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP COLUMN "bidId"`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "bidGamePlayerId" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "UQ_dffaef5fe782b7efd530c0729a6" UNIQUE ("bidGamePlayerId")`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "bidGameComboId" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "UQ_dcda9fcab6e3c674dc6a81e2891" UNIQUE ("bidGameComboId")`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6" FOREIGN KEY ("bidGamePlayerId") REFERENCES "bid_game_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_dcda9fcab6e3c674dc6a81e2891" FOREIGN KEY ("bidGameComboId") REFERENCES "bid_game_combo"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_dcda9fcab6e3c674dc6a81e2891"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "UQ_dcda9fcab6e3c674dc6a81e2891"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "bidGameComboId"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "UQ_dffaef5fe782b7efd530c0729a6"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "bidGamePlayerId"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD "bidId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "UQ_36d76b3bfbc25b38cbdee697f8b" UNIQUE ("bidId")`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD "bidId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "UQ_d1307cae847c64eae9f82500e01" UNIQUE ("bidId")`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "FK_36d76b3bfbc25b38cbdee697f8b" FOREIGN KEY ("bidId") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_d1307cae847c64eae9f82500e01" FOREIGN KEY ("bidId") REFERENCES "bid"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
