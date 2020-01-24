import {MigrationInterface, QueryRunner} from "typeorm";

export class Player1579851755957 implements MigrationInterface {
    name = 'Player1579851755957'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "player" ("id" SERIAL NOT NULL, "displayName" character varying NOT NULL, "steamId" character varying, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "player"`, undefined);
    }

}
