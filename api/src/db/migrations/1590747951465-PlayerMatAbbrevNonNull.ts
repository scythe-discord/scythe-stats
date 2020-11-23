import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlayerMatAbbrevNonNull1590747951465 implements MigrationInterface {
  name = 'PlayerMatAbbrevNonNull1590747951465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_mat" ALTER COLUMN "abbrev" SET NOT NULL`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_mat" ALTER COLUMN "abbrev" DROP NOT NULL`,
      undefined
    );
  }
}
