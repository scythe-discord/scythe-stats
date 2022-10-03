import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameComboAndPlayer1662329501313 implements MigrationInterface {
    name = 'BidGameComboAndPlayer1662329501313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bid_game_player" ("id" SERIAL NOT NULL, "dateJoined" TIMESTAMP NOT NULL, "bidGameId" integer, "userId" integer, CONSTRAINT "bid_game_player_unique" UNIQUE ("bidGameId", "userId"), CONSTRAINT "PK_dc2fecf50be2249a546147eb476" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bid_game_combo" ("id" SERIAL NOT NULL, "selected" boolean NOT NULL, "bidGameId" integer, "factionId" integer, "playerMatId" integer, CONSTRAINT "bid_game_combo_unique" UNIQUE ("bidGameId", "factionId", "playerMatId"), CONSTRAINT "PK_3aaee4eeecc67abb4a68d97b3b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "bidPresetSettingId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_ce4f388f0b6371ca6e83a6f5e76" FOREIGN KEY ("bidGameId") REFERENCES "bid_game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_0f0c8f9857a8be36ddb5bbbd82d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD CONSTRAINT "FK_272e5e4290e72b347c1cd341ff8" FOREIGN KEY ("bidPresetSettingId") REFERENCES "bid_preset_setting"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "FK_d02402f5601654ed27d19517c60" FOREIGN KEY ("bidGameId") REFERENCES "bid_game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "FK_f12a15aa683d7dacf584d04075c" FOREIGN KEY ("factionId") REFERENCES "faction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD CONSTRAINT "FK_81c87a11729db79068e1e5181f8" FOREIGN KEY ("playerMatId") REFERENCES "player_mat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "FK_81c87a11729db79068e1e5181f8"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "FK_f12a15aa683d7dacf584d04075c"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP CONSTRAINT "FK_d02402f5601654ed27d19517c60"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP CONSTRAINT "FK_272e5e4290e72b347c1cd341ff8"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_0f0c8f9857a8be36ddb5bbbd82d"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_ce4f388f0b6371ca6e83a6f5e76"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "bidPresetSettingId"`);
        await queryRunner.query(`DROP TABLE "bid_game_combo"`);
        await queryRunner.query(`DROP TABLE "bid_game_player"`);
    }

}
