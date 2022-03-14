import {MigrationInterface, QueryRunner} from "typeorm";

export class BidGameTimeLimit1662925259274 implements MigrationInterface {
    name = 'BidGameTimeLimit1662925259274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" ADD "bidTimeLimitSeconds" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid_game" DROP COLUMN "bidTimeLimitSeconds"`);
    }

}
