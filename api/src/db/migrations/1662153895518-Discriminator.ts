import {MigrationInterface, QueryRunner} from "typeorm";

export class Discriminator1662153895518 implements MigrationInterface {
    name = 'Discriminator1662153895518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "discriminator" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "discriminator"`);
    }

}
