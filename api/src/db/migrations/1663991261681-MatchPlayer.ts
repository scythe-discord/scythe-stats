import {MigrationInterface, QueryRunner} from "typeorm";

export class MatchPlayer1663991261681 implements MigrationInterface {
    name = 'MatchPlayer1663991261681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_432d5047bcf5ad1d10b8e3e414"`);
        await queryRunner.query(`ALTER TABLE "player" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "UQ_7687919bf054bf262c669d3ae21" UNIQUE ("userId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4afed942c63686b00386a9b796" ON "player" ("displayName") WHERE "steamId" IS NULL AND "userId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_7687919bf054bf262c669d3ae21"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4afed942c63686b00386a9b796"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "UQ_7687919bf054bf262c669d3ae21"`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "userId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_432d5047bcf5ad1d10b8e3e414" ON "player" ("displayName") WHERE ("steamId" IS NULL)`);
    }

}
