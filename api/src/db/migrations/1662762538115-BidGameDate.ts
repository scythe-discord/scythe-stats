import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameDate1662762538115 implements MigrationInterface {
    name = 'BidGameDate1662762538115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "createdAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "modifiedAt" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "modifiedAt"`);
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "createdAt"`);
    }

}
