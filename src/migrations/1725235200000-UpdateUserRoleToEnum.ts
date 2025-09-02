import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRoleToEnum1725235200000 implements MigrationInterface {
  name = 'UpdateUserRoleToEnum1725235200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type if it doesn't exist
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM('admin', 'hr', 'company_owner');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    // Update existing rows to have valid enum values
    await queryRunner.query(
      `UPDATE "users" SET "role" = 'hr' WHERE "role" NOT IN ('admin', 'hr', 'company_owner')`,
    );

    // Check if column is already enum type
    const result = await queryRunner.query(
      `SELECT data_type FROM information_schema.columns 
       WHERE table_name = 'users' AND column_name = 'role'`,
    );

    // Only change column type if it's not already an enum
    if (result[0]?.data_type !== 'USER-DEFINED') {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_enum" USING "role"::"user_role_enum"`,
      );
    }

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
