import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGamePlayerCombo1663002377988 implements MigrationInterface {
    name = 'BidGamePlayerCombo1663002377988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD "bidGameComboId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "UQ_b61992634f65f5aa7fa0f784cd0" UNIQUE ("bidGameComboId")`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD CONSTRAINT "FK_b61992634f65f5aa7fa0f784cd0" FOREIGN KEY ("bidGameComboId") REFERENCES "bid_game_combo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "FK_b61992634f65f5aa7fa0f784cd0"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP CONSTRAINT "UQ_b61992634f65f5aa7fa0f784cd0"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP COLUMN "bidGameComboId"`);
    }

}
