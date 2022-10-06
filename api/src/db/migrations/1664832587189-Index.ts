import {MigrationInterface, QueryRunner} from "typeorm";

export class Index1664832587189 implements MigrationInterface {
    name = 'Index1664832587189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_trueskill" DROP COLUMN "history"`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "mu" TYPE numeric(7,2)`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "sigma" TYPE numeric(7,2)`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "sigma" SET DEFAULT '8.333333333333334'`);
        await queryRunner.query(`CREATE INDEX "IDX_b66b7904d8894932b1a0b77da7" ON "bid_game" ("ranked", "status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_b66b7904d8894932b1a0b77da7"`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "sigma" SET DEFAULT 8.333333333333334`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "sigma" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ALTER COLUMN "mu" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user_trueskill" ADD "history" jsonb NOT NULL DEFAULT '[]'`);
    }

}
