import {MigrationInterface, QueryRunner} from "typeorm";

export class PlayerUniqueDisplayNameWhenNoSteamId1579861216776 implements MigrationInterface {
    name = 'PlayerUniqueDisplayNameWhenNoSteamId1579861216776'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_432d5047bcf5ad1d10b8e3e414" ON "player" ("displayName") WHERE "steamId" IS NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_432d5047bcf5ad1d10b8e3e414"`, undefined);
    }

}
