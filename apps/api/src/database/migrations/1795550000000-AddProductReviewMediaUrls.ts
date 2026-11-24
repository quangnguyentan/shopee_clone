import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductReviewMediaUrls1795550000000
  implements MigrationInterface
{
  name = 'AddProductReviewMediaUrls1795550000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_reviews"
      ADD COLUMN IF NOT EXISTS "media_urls" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product_reviews"
      DROP COLUMN IF EXISTS "media_urls"
    `);
  }
}
