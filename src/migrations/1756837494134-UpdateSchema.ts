import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1756837494134 implements MigrationInterface {
    name = 'UpdateSchema1756837494134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_0a11b67ffeb92e6dd4c75a423f8"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "employment_type"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "salary_range"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "is_remote"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "hr_id"`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_job_type_enum" AS ENUM('full-time', 'part-time', 'contract', 'internship')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "job_type" "public"."job_posts_job_type_enum" NOT NULL DEFAULT 'full-time'`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_job_level_enum" AS ENUM('entry', 'mid', 'senior', 'lead', 'manager')`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "job_level" "public"."job_posts_job_level_enum" NOT NULL DEFAULT 'mid'`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "salary" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "created_by" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'hr', 'company_owner')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'hr'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "job_applications" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."job_applications_status_enum" AS ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted')`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD "status" "public"."job_applications_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8"`);
        await queryRunner.query(`ALTER TABLE "job_applications" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."job_applications_status_enum"`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD "status" character varying NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'hr', 'company_owner')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'hr'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "salary"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "job_level"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_job_level_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN "job_type"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_job_type_enum"`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "hr_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "is_remote" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "salary_range" character varying`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD "employment_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_0a11b67ffeb92e6dd4c75a423f8" FOREIGN KEY ("hr_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
