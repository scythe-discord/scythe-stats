import { MigrationInterface, QueryRunner } from 'typeorm';

export class Trueskill1664499358878 implements MigrationInterface {
  name = 'Trueskill1664499358878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_trueskill" ("id" SERIAL NOT NULL, "mu" numeric NOT NULL DEFAULT '25', "sigma" numeric NOT NULL DEFAULT '8.333333333333333', "history" jsonb NOT NULL DEFAULT '[]', "userId" integer, CONSTRAINT "REL_34ad4bbe24300e04d89845d6d9" UNIQUE ("userId"), CONSTRAINT "PK_0c30c283416bd9176ab2687bc4d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user_trueskill" ADD CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `INSERT INTO "user_trueskill" ("userId") SELECT "id" AS "userId" FROM "user"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_trueskill" DROP CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98"`
    );
    await queryRunner.query(`DROP TABLE "user_trueskill"`);
  }
}
