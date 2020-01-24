import {MigrationInterface, QueryRunner} from "typeorm";

export class Faction1579851479207 implements MigrationInterface {
    name = 'Faction1579851479207'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "faction" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_51b7d060b06c5b3ed9e3411f6bc" UNIQUE ("name"), CONSTRAINT "PK_5935637aa4ecd999ac0555ae5a6" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "faction"`, undefined);
    }

}
