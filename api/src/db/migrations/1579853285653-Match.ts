import {MigrationInterface, QueryRunner} from "typeorm";

export class Match1579853285653 implements MigrationInterface {
    name = 'Match1579853285653'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "match" ("id" SERIAL NOT NULL, "numRounds" integer NOT NULL, "datePlayed" TIMESTAMP NOT NULL, CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "player_match_result" ("id" SERIAL NOT NULL, "coins" integer NOT NULL, "playerId" integer, "factionId" integer, "playerMatId" integer, "matchId" integer, CONSTRAINT "PK_0f17d1eb459f385a9b34284a7a2" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" ADD CONSTRAINT "FK_f3ace3c5b33b8b35445c854199a" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" ADD CONSTRAINT "FK_a6aceb84c4c2dd136234bb5e4ce" FOREIGN KEY ("factionId") REFERENCES "faction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" ADD CONSTRAINT "FK_861d5bac55cf6e0c4f59708ccce" FOREIGN KEY ("playerMatId") REFERENCES "player_mat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" ADD CONSTRAINT "FK_5c2052d36dd2a9775c4ad0a00af" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "player_match_result" DROP CONSTRAINT "FK_5c2052d36dd2a9775c4ad0a00af"`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" DROP CONSTRAINT "FK_861d5bac55cf6e0c4f59708ccce"`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" DROP CONSTRAINT "FK_a6aceb84c4c2dd136234bb5e4ce"`, undefined);
        await queryRunner.query(`ALTER TABLE "player_match_result" DROP CONSTRAINT "FK_f3ace3c5b33b8b35445c854199a"`, undefined);
        await queryRunner.query(`DROP TABLE "player_match_result"`, undefined);
        await queryRunner.query(`DROP TABLE "match"`, undefined);
    }

}
