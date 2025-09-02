import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceJobApplications1756838332398 implements MigrationInterface {
  name = 'EnhanceJobApplications1756838332398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "years_of_experience" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "current_position" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "linkedin_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "portfolio_url" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "cover_letter" text`,
    );
    await queryRunner.query(`ALTER TABLE "job_applications" ADD "notes" text`);
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "expected_salary" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "hr_notes" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e051d6c527729acd8733d492f1" ON "visitors" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_632219a2969c40aa04e3178c7f" ON "job_applications" ("job_id", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "UQ_441cc5d7ba25def8fe8d889f9c6" UNIQUE ("job_id", "visitor_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "UQ_441cc5d7ba25def8fe8d889f9c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_632219a2969c40aa04e3178c7f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e051d6c527729acd8733d492f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "hr_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "expected_salary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP COLUMN "cover_letter"`,
    );
    await queryRunner.query(`ALTER TABLE "visitors" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP COLUMN "portfolio_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP COLUMN "linkedin_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP COLUMN "current_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visitors" DROP COLUMN "years_of_experience"`,
    );
    await queryRunner.query(`ALTER TABLE "visitors" DROP COLUMN "address"`);
  }
}
