import { MigrationInterface, QueryRunner } from 'typeorm';

export class BidGameDefaultPreset1663457804513 implements MigrationInterface {
  name = 'BidGameDefaultPreset1663457804513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bid_preset" ADD "default" boolean`);
    await queryRunner.query(
      `ALTER TABLE "bid_preset" ADD CONSTRAINT "UQ_d401f141880bfee0e3dc79e6849" UNIQUE ("default")`
    );
    await queryRunner.query(
      `UPDATE "bid_preset" SET "default" = true WHERE "name" = 'IFA'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid_preset" DROP CONSTRAINT "UQ_d401f141880bfee0e3dc79e6849"`
    );
    await queryRunner.query(`ALTER TABLE "bid_preset" DROP COLUMN "default"`);
  }
}
