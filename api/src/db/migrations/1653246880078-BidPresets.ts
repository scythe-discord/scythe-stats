import { MigrationInterface, QueryRunner } from 'typeorm';

export class BidPresets1653246880078 implements MigrationInterface {
  name = 'BidPresets1653246880078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bid_preset" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "position" integer NOT NULL, CONSTRAINT "PK_3bc34db5df736279e55a05c1d17" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "bid_preset_setting" ("id" SERIAL NOT NULL, "enabled" boolean NOT NULL, "bidPresetId" integer, "factionId" integer, "playerMatId" integer, CONSTRAINT "UQ_51f6ea6ad6095302f8a3c346a62" UNIQUE ("bidPresetId", "factionId", "playerMatId"), CONSTRAINT "PK_d1dbecce5fd2f25bb3da6af9f72" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_preset_setting" ADD CONSTRAINT "FK_dc89f107778846935ca8cc115c0" FOREIGN KEY ("bidPresetId") REFERENCES "bid_preset"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_preset_setting" ADD CONSTRAINT "FK_1ca320662cc1a333aad4a26b522" FOREIGN KEY ("factionId") REFERENCES "faction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_preset_setting" ADD CONSTRAINT "FK_72565665c24358fffccb9ea6d21" FOREIGN KEY ("playerMatId") REFERENCES "player_mat"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid_preset_setting" DROP CONSTRAINT "FK_72565665c24358fffccb9ea6d21"`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_preset_setting" DROP CONSTRAINT "FK_1ca320662cc1a333aad4a26b522"`
    );
    await queryRunner.query(
      `ALTER TABLE "bid_preset_setting" DROP CONSTRAINT "FK_dc89f107778846935ca8cc115c0"`
    );
    await queryRunner.query(`DROP TABLE "bid_preset_setting"`);
    await queryRunner.query(`DROP TABLE "bid_preset"`);
  }
}
