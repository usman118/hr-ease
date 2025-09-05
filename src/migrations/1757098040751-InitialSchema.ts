import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1757098040751 implements MigrationInterface {
    name = 'InitialSchema1757098040751'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "visitors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "telephone" character varying, "document_url" character varying, "address" character varying, "years_of_experience" integer, "current_position" character varying, "linkedin_url" character varying, "portfolio_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d0fd6e34a516c2bb3bbec71abde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e051d6c527729acd8733d492f1" ON "visitors" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'hr', 'company_owner')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'hr', "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone" character varying, "profile_image" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "industry" character varying, "website" character varying, "description" text, "address" character varying, "city" character varying, "country" character varying, "owner_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_job_type_enum" AS ENUM('full-time', 'part-time', 'contract', 'internship')`);
        await queryRunner.query(`CREATE TYPE "public"."job_posts_job_level_enum" AS ENUM('entry', 'mid', 'senior', 'lead', 'manager')`);
        await queryRunner.query(`CREATE TABLE "job_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "requirements" text NOT NULL, "job_type" "public"."job_posts_job_type_enum" NOT NULL DEFAULT 'full-time', "job_level" "public"."job_posts_job_level_enum" NOT NULL DEFAULT 'mid', "location" character varying NOT NULL, "salary" numeric(10,2), "company_id" uuid NOT NULL, "created_by" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ecf5b9e46cd2940d254204a73a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company_hr" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "hr_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ce862869e4e1c254df7ee44989d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."job_applications_status_enum" AS ENUM('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted')`);
        await queryRunner.query(`CREATE TABLE "job_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "visitor_id" uuid NOT NULL, "cover_letter" text, "notes" text, "expected_salary" numeric(10,2), "status" "public"."job_applications_status_enum" NOT NULL DEFAULT 'pending', "hr_notes" text, "applied_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_441cc5d7ba25def8fe8d889f9c6" UNIQUE ("job_id", "visitor_id"), CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_632219a2969c40aa04e3178c7f" ON "job_applications" ("job_id", "status") `);
        await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_99666f01665f814e46461e21d3b" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_posts" ADD CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_hr" ADD CONSTRAINT "FK_5e79d3e08b2871386aa81471c07" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_hr" ADD CONSTRAINT "FK_6813b7ca4ff4650813f74d350fd" FOREIGN KEY ("hr_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD CONSTRAINT "FK_cc61bbb18e1a613dde840b199a0" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_cc61bbb18e1a613dde840b199a0"`);
        await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958"`);
        await queryRunner.query(`ALTER TABLE "company_hr" DROP CONSTRAINT "FK_6813b7ca4ff4650813f74d350fd"`);
        await queryRunner.query(`ALTER TABLE "company_hr" DROP CONSTRAINT "FK_5e79d3e08b2871386aa81471c07"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8"`);
        await queryRunner.query(`ALTER TABLE "job_posts" DROP CONSTRAINT "FK_99666f01665f814e46461e21d3b"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_632219a2969c40aa04e3178c7f"`);
        await queryRunner.query(`DROP TABLE "job_applications"`);
        await queryRunner.query(`DROP TYPE "public"."job_applications_status_enum"`);
        await queryRunner.query(`DROP TABLE "company_hr"`);
        await queryRunner.query(`DROP TABLE "job_posts"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_job_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."job_posts_job_type_enum"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e051d6c527729acd8733d492f1"`);
        await queryRunner.query(`DROP TABLE "visitors"`);
    }

}
