import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameCombo1662924980564 implements MigrationInterface {
    name = 'BidGameCombo1662924980564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" DROP CONSTRAINT "FK_272e5e4290e72b347c1cd341ff8"`);
        await queryRunner.query(`ALTER TABLE "bid_game" RENAME COLUMN "bidPresetSettingId" TO "bidPresetId"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" DROP COLUMN "selected"`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD CONSTRAINT "FK_eb7d1ffed60331b5efdffe591dd" FOREIGN KEY ("bidPresetId") REFERENCES "bid_preset"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" DROP CONSTRAINT "FK_eb7d1ffed60331b5efdffe591dd"`);
        await queryRunner.query(`ALTER TABLE "bid_game_combo" ADD "selected" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bid_game" RENAME COLUMN "bidPresetId" TO "bidPresetSettingId"`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD CONSTRAINT "FK_272e5e4290e72b347c1cd341ff8" FOREIGN KEY ("bidPresetSettingId") REFERENCES "bid_preset_setting"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
