import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShopProvinceLocation1795540000000
  implements MigrationInterface
{
  name = 'AddShopProvinceLocation1795540000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD COLUMN IF NOT EXISTS "province_code" integer,
      ADD COLUMN IF NOT EXISTS "province_name" varchar(100)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_shops_province_code"
      ON "shops" ("province_code")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_shops_province_code"
    `);
    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN IF EXISTS "province_code",
      DROP COLUMN IF EXISTS "province_name"
    `);
  }
}
