import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileDetails1795500000000 implements MigrationInterface {
  name = 'AddUserProfileDetails1795500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "gender" varchar(10),
        ADD COLUMN IF NOT EXISTS "date_of_birth" date
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "date_of_birth",
        DROP COLUMN IF EXISTS "gender"
    `);
  }
}
