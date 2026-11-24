import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableShopFollowAndChat1795541000000
  implements MigrationInterface
{
  name = 'EnableShopFollowAndChat1795541000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "shop_follows" (
        "id" serial PRIMARY KEY,
        "user_id" bigint NOT NULL,
        "shop_id" bigint NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_shop_follows_shop"
          FOREIGN KEY ("shop_id") REFERENCES "shops"("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" bigserial PRIMARY KEY,
        "sender_id" bigint NOT NULL,
        "receiver_shop_id" bigint NOT NULL,
        "buyer_id" bigint,
        "message" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_chat_messages_sender"
          FOREIGN KEY ("sender_id") REFERENCES "users"("id"),
        CONSTRAINT "FK_chat_messages_shop"
          FOREIGN KEY ("receiver_shop_id") REFERENCES "shops"("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_shop_follows_user_shop"
      ON "shop_follows" ("user_id", "shop_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "chat_messages"
      ADD COLUMN IF NOT EXISTS "buyer_id" bigint
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_messages_shop_buyer_created"
      ON "chat_messages" ("receiver_shop_id", "buyer_id", "created_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_chat_messages_shop_buyer_created"
    `);
    await queryRunner.query(`
      ALTER TABLE "chat_messages"
      DROP COLUMN IF EXISTS "buyer_id"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "uq_shop_follows_user_shop"
    `);
  }
}
