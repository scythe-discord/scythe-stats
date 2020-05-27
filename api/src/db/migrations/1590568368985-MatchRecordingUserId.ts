import {MigrationInterface, QueryRunner} from "typeorm";

export class MatchRecordingUserId1590568368985 implements MigrationInterface {
    name = 'MatchRecordingUserId1590568368985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" ADD "recordingUserId" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "recordingUserId"`, undefined);
    }

}
