import { MigrationInterface, QueryRunner } from 'typeorm';

export class DiscordBlacklist1591244882182 implements MigrationInterface {
  name = 'DiscordBlacklist1591244882182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "discord_blacklist" ("id" SERIAL NOT NULL, "discordId" character varying NOT NULL, CONSTRAINT "PK_8db294dddf49f12026fd9ee25af" PRIMARY KEY ("id"))`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "discord_blacklist"`, undefined);
  }
}
