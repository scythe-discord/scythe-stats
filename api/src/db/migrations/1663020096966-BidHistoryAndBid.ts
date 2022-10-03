import {MigrationInterface, QueryRunner} from "typeorm";

export class BidHistoryAndBid1663020096966 implements MigrationInterface {
    name = 'BidHistoryAndBid1663020096966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_b61992634f65f5aa7fa0f784cd0"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_5e7cd1a7fc3faff08018a8082d2"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_dfcb6584ecdab8c8453734e4261"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "UQ_a4ada26c52fc91b1131024c6b99"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" RENAME COLUMN "bidGameComboId" TO "bidId"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" RENAME CONSTRAINT "UQ_b61992634f65f5aa7fa0f784cd0" TO "UQ_d1307cae847c64eae9f82500e01"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "factionId"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "playerMatId"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "bidGamePlayerId"`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "bidHistory" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD "bidId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "UQ_36d76b3bfbc25b38cbdee697f8b" UNIQUE ("bidId")`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_d1307cae847c64eae9f82500e01" FOREIGN KEY ("bidId") REFERENCES "bid"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "FK_36d76b3bfbc25b38cbdee697f8b" FOREIGN KEY ("bidId") REFERENCES "bid"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "FK_36d76b3bfbc25b38cbdee697f8b"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_d1307cae847c64eae9f82500e01"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "UQ_36d76b3bfbc25b38cbdee697f8b"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP COLUMN "bidId"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "bidHistory"`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "bidGamePlayerId" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "playerMatId" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "factionId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" RENAME CONSTRAINT "UQ_d1307cae847c64eae9f82500e01" TO "UQ_b61992634f65f5aa7fa0f784cd0"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" RENAME COLUMN "bidId" TO "bidGameComboId"`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "UQ_a4ada26c52fc91b1131024c6b99" UNIQUE ("coins", "factionId", "playerMatId", "bidGamePlayerId")`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_dfcb6584ecdab8c8453734e4261" FOREIGN KEY ("factionId") REFERENCES "faction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_5e7cd1a7fc3faff08018a8082d2" FOREIGN KEY ("playerMatId") REFERENCES "player_mat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6" FOREIGN KEY ("bidGamePlayerId") REFERENCES "bid_game_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_b61992634f65f5aa7fa0f784cd0" FOREIGN KEY ("bidGameComboId") REFERENCES "bid_game_combo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
