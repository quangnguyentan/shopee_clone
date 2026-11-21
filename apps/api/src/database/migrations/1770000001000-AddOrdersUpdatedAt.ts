import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersUpdatedAt1770000001000 implements MigrationInterface {
  name = 'AddOrdersUpdatedAt1770000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
      DROP COLUMN IF EXISTS updated_at
    `);
  }
}
