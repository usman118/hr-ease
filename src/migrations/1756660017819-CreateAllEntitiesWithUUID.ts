import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllEntitiesWithUUID1756660017819
  implements MigrationInterface
{
  name = 'CreateAllEntitiesWithUUID1756660017819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "industry" character varying, "website" character varying, "description" text, "address" character varying, "city" character varying, "country" character varying, "owner_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "requirements" text NOT NULL, "employment_type" character varying NOT NULL, "location" character varying NOT NULL, "salary_range" character varying, "is_remote" boolean NOT NULL DEFAULT false, "company_id" uuid NOT NULL, "hr_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ecf5b9e46cd2940d254204a73a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visitors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "telephone" character varying, "document_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d0fd6e34a516c2bb3bbec71abde" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "visitor_id" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "applied_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "company_hr" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "hr_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ce862869e4e1c254df7ee44989d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "first_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_image" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD CONSTRAINT "FK_99666f01665f814e46461e21d3b" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD CONSTRAINT "FK_0a11b67ffeb92e6dd4c75a423f8" FOREIGN KEY ("hr_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_cc61bbb18e1a613dde840b199a0" FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_hr" ADD CONSTRAINT "FK_5e79d3e08b2871386aa81471c07" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_hr" ADD CONSTRAINT "FK_6813b7ca4ff4650813f74d350fd" FOREIGN KEY ("hr_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_hr" DROP CONSTRAINT "FK_6813b7ca4ff4650813f74d350fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_hr" DROP CONSTRAINT "FK_5e79d3e08b2871386aa81471c07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_cc61bbb18e1a613dde840b199a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP CONSTRAINT "FK_0a11b67ffeb92e6dd4c75a423f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP CONSTRAINT "FK_99666f01665f814e46461e21d3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_image"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "firstName" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "company_hr"`);
    await queryRunner.query(`DROP TABLE "job_applications"`);
    await queryRunner.query(`DROP TABLE "visitors"`);
    await queryRunner.query(`DROP TABLE "job_posts"`);
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
