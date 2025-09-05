import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvitationFields1757099959782 implements MigrationInterface {
    name = 'AddInvitationFields1757099959782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "invitation_token" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "invitation_expires_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "invitation_accepted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "invitation_accepted"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "invitation_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "invitation_token"`);
    }

}
