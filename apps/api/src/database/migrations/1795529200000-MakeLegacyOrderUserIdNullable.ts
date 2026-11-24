import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeLegacyOrderUserIdNullable1795529200000 implements MigrationInterface {
  name = 'MakeLegacyOrderUserIdNullable1795529200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "user_id" DROP NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "orders"
      SET "user_id" = "buyer_id"
      WHERE "user_id" IS NULL AND "buyer_id" IS NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ALTER COLUMN "user_id" SET NOT NULL
    `);
  }
}
