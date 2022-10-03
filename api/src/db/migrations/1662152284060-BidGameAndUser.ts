import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameAndUser1662152284060 implements MigrationInterface {
    name = 'BidGameAndUser1662152284060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "discordId" character varying NOT NULL, "displayName" character varying, CONSTRAINT "UQ_13af5754f14d8d255fd9b3ee5c7" UNIQUE ("discordId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bid" ("id" SERIAL NOT NULL, "coins" integer NOT NULL, "date" TIMESTAMP NOT NULL, "bidGameId" integer, "userId" integer, "factionId" integer, "playerMatId" integer, CONSTRAINT "UQ_b7f3238cd39c45de47c05cd69c2" UNIQUE ("bidGameId", "factionId", "playerMatId", "coins"), CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bid_game_status_enum" AS ENUM('CREATED', 'DELETED', 'BIDDING', 'BIDDING_FINISHED', 'GAME_RECORDED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "bid_game" ("id" SERIAL NOT NULL, "status" "public"."bid_game_status_enum" NOT NULL DEFAULT 'CREATED', "matchId" integer, CONSTRAINT "REL_873ad736f9b84ef318de13fd22" UNIQUE ("matchId"), CONSTRAINT "PK_2e6c9e13f6116092b569c0aef36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_bid_games_bid_game" ("userId" integer NOT NULL, "bidGameId" integer NOT NULL, CONSTRAINT "PK_d2e5f138f4f68eecf48715b7171" PRIMARY KEY ("userId", "bidGameId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_57fe6dab14ed96296acc1d6d13" ON "user_bid_games_bid_game" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d7fe2f19e42286074bd98226c" ON "user_bid_games_bid_game" ("bidGameId") `);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_c600569a00c47598ba30a56364f" FOREIGN KEY ("bidGameId") REFERENCES "bid_game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_b0f254bd6d29d3da2b6a8af262b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_dfcb6584ecdab8c8453734e4261" FOREIGN KEY ("factionId") REFERENCES "faction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_5e7cd1a7fc3faff08018a8082d2" FOREIGN KEY ("playerMatId") REFERENCES "player_mat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD CONSTRAINT "FK_873ad736f9b84ef318de13fd220" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_bid_games_bid_game" ADD CONSTRAINT "FK_57fe6dab14ed96296acc1d6d133" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_bid_games_bid_game" ADD CONSTRAINT "FK_4d7fe2f19e42286074bd98226c1" FOREIGN KEY ("bidGameId") REFERENCES "bid_game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_bid_games_bid_game" DROP CONSTRAINT "FK_4d7fe2f19e42286074bd98226c1"`);
        await queryRunner.query(`ALTER TABLE "user_bid_games_bid_game" DROP CONSTRAINT "FK_57fe6dab14ed96296acc1d6d133"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP CONSTRAINT "FK_873ad736f9b84ef318de13fd220"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_5e7cd1a7fc3faff08018a8082d2"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_dfcb6584ecdab8c8453734e4261"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_b0f254bd6d29d3da2b6a8af262b"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_c600569a00c47598ba30a56364f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d7fe2f19e42286074bd98226c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57fe6dab14ed96296acc1d6d13"`);
        await queryRunner.query(`DROP TABLE "user_bid_games_bid_game"`);
        await queryRunner.query(`DROP TABLE "bid_game"`);
        await queryRunner.query(`DROP TYPE "public"."bid_game_status_enum"`);
        await queryRunner.query(`DROP TABLE "bid"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
