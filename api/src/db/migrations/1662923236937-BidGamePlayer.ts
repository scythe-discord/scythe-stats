import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGamePlayer1662923236937 implements MigrationInterface {
    name = 'BidGamePlayer1662923236937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_b0f254bd6d29d3da2b6a8af262b"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_c600569a00c47598ba30a56364f"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "UQ_b7f3238cd39c45de47c05cd69c2"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "bidGameId"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "bidGamePlayerId" integer`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" ADD "order" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "UQ_a4ada26c52fc91b1131024c6b99" UNIQUE ("bidGamePlayerId", "factionId", "playerMatId", "coins")`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6" FOREIGN KEY ("bidGamePlayerId") REFERENCES "bid_game_player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "UQ_a4ada26c52fc91b1131024c6b99"`);
        await queryRunner.query(`ALTER TABLE "bid_game_player" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "bidGamePlayerId"`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD "bidGameId" integer`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "UQ_b7f3238cd39c45de47c05cd69c2" UNIQUE ("coins", "bidGameId", "factionId", "playerMatId")`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_c600569a00c47598ba30a56364f" FOREIGN KEY ("bidGameId") REFERENCES "bid_game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_b0f254bd6d29d3da2b6a8af262b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
