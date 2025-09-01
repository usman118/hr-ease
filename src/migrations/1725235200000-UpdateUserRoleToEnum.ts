import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRoleToEnum1725235200000 implements MigrationInterface {
  name = 'UpdateUserRoleToEnum1725235200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('admin', 'hr', 'company_owner')`,
    );

    // Update existing rows to have valid enum values
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'hr' WHERE "role" NOT IN ('admin', 'hr', 'company_owner')`,
    );

    // Change the column type to use the enum
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_enum" USING "role"::"user_role_enum"`,
    );

    // Set default value
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'hr'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Change column back to varchar
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE character varying`,
    );

    // Drop the enum type
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
