import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarketplaceOrderSchema1770000000000 implements MigrationInterface {
  name = 'MarketplaceOrderSchema1770000000000';

  private async assertNoRows(
    queryRunner: QueryRunner,
    label: string,
    sql: string,
  ) {
    const rows = await queryRunner.query(sql);
    if (rows.length) {
      console.error(`[${this.name}] ${label}`, JSON.stringify(rows));
      throw new Error(
        `${label}; resolve the reported rows and rerun the migration`,
      );
    }
  }

  private async backfillSlug(
    queryRunner: QueryRunner,
    table: 'categories' | 'products' | 'shops',
    scopeColumn: string | null,
  ) {
    const scopeSelect = scopeColumn ? `${scopeColumn},` : '';
    const scopePartition = scopeColumn ? `${scopeColumn}, ` : '';
    const fallbackPrefix =
      table === 'categories' ? 'category' : table === 'products' ? 'product' : 'shop';
    await queryRunner.query(`
      WITH normalized AS (
        SELECT id, ${scopeSelect}
          COALESCE(
            NULLIF(
              trim(both '-' FROM regexp_replace(
                lower(unaccent(name)),
                '[^a-z0-9]+',
                '-',
                'g'
              )),
              ''
            ),
            '${fallbackPrefix}-' || id::text
          ) AS base_slug
        FROM ${table}
      ),
      counted AS (
        SELECT *, count(*) OVER (PARTITION BY ${scopePartition}base_slug) AS duplicate_count
        FROM normalized
      ),
      candidates AS (
        SELECT *, CASE WHEN duplicate_count > 1
          THEN base_slug || '-' || id::text
          ELSE base_slug
        END AS candidate_slug
        FROM counted
      ),
      collision_checked AS (
        SELECT *, count(*) OVER (PARTITION BY ${scopePartition}candidate_slug) AS candidate_count
        FROM candidates
      )
      UPDATE ${table} target
      SET slug = CASE WHEN collision_checked.candidate_count > 1
        THEN collision_checked.base_slug || '-' || collision_checked.id::text
        ELSE collision_checked.candidate_slug
      END
      FROM collision_checked
      WHERE target.id = collision_checked.id
    `);
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS unaccent');

    await queryRunner.query(`
      CREATE TYPE shops_status_enum AS ENUM ('pending', 'active', 'suspended');
      CREATE TYPE orders_status_enum AS ENUM (
        'pending_payment', 'paid', 'processing', 'shipped', 'completed',
        'cancelled', 'refund_pending', 'refunded'
      );
      CREATE TYPE orders_payment_status_enum AS ENUM (
        'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
      );
      CREATE TYPE shop_orders_status_enum AS ENUM (
        'pending_payment', 'paid', 'processing', 'shipped', 'completed',
        'cancelled', 'refund_pending', 'refunded'
      );
      CREATE TYPE shop_orders_shipping_status_enum AS ENUM (
        'unfulfilled', 'preparing', 'shipped', 'delivered', 'returned', 'cancelled'
      );
      CREATE TYPE payments_status_enum AS ENUM (
        'pending', 'succeeded', 'failed', 'cancelled', 'refunded'
      );
      CREATE TYPE shippings_status_enum AS ENUM (
        'pending', 'ready_to_ship', 'shipped', 'delivered', 'failed', 'returned', 'cancelled'
      );
      CREATE TYPE vouchers_scope_enum AS ENUM ('platform', 'shop', 'shipping');
      CREATE TYPE inventory_reservations_status_enum AS ENUM (
        'holding', 'confirmed', 'released', 'expired'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE categories
        ADD COLUMN deleted_at timestamptz,
        ADD COLUMN slug varchar(255);
      ALTER TABLE products
        ADD COLUMN deleted_at timestamptz,
        ADD COLUMN slug varchar(255),
        ADD COLUMN is_active boolean;
      DO $$
      DECLARE item record;
      BEGIN
        FOR item IN
          SELECT conname FROM pg_constraint
          WHERE conrelid = 'products'::regclass AND contype = 'f'
            AND pg_get_constraintdef(oid) ILIKE '%(shop_id)%'
        LOOP
          EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', item.conname);
        END LOOP;
      END $$;
      ALTER TABLE products ALTER COLUMN shop_id TYPE bigint USING shop_id::bigint;
      ALTER TABLE shops
        ADD COLUMN deleted_at timestamptz,
        ADD COLUMN slug varchar(255),
        ADD COLUMN follower_count integer,
        ADD COLUMN rating_count integer,
        ADD COLUMN status shops_status_enum;
      ALTER TABLE users
        ADD COLUMN deleted_at timestamptz,
        ADD COLUMN password_hash varchar(255);

      ALTER TABLE orders
        ADD COLUMN buyer_id bigint,
        ADD COLUMN order_no varchar(40),
        ADD COLUMN shipping_address jsonb,
        ADD COLUMN subtotal numeric(18,2),
        ADD COLUMN shipping_fee numeric(18,2),
        ADD COLUMN discount_amount numeric(18,2),
        ADD COLUMN currency char(3),
        ADD COLUMN payment_status orders_payment_status_enum,
        ADD COLUMN cancelled_reason text,
        ADD COLUMN cancelled_at timestamptz,
        ADD COLUMN status_legacy varchar,
        ADD COLUMN status_new orders_status_enum;

      ALTER TABLE order_items
        ADD COLUMN shop_id bigint,
        ADD COLUMN shop_order_id bigint,
        ADD COLUMN product_name varchar(255),
        ADD COLUMN sku varchar(255),
        ADD COLUMN variant_label varchar(500),
        ADD COLUMN image_url varchar(1000);

      ALTER TABLE product_variants
        ADD COLUMN compare_at_price numeric(18,2),
        ADD COLUMN attribute_signature varchar(64);
      ALTER TABLE product_images
        ADD COLUMN sort_order integer;
      ALTER TABLE product_reviews
        ADD COLUMN order_item_id bigint,
        ADD COLUMN shop_reply text,
        ADD COLUMN shop_replied_at timestamptz;

      ALTER TABLE payments
        ADD COLUMN provider varchar(64),
        ADD COLUMN provider_transaction_id varchar(255),
        ADD COLUMN idempotency_key varchar(128),
        ADD COLUMN amount numeric(18,2),
        ADD COLUMN currency char(3),
        ADD COLUMN created_at timestamptz,
        ADD COLUMN failure_reason text,
        ADD COLUMN status_legacy varchar,
        ADD COLUMN status_new payments_status_enum;

      ALTER TABLE shippings
        ADD COLUMN shop_order_id bigint,
        ADD COLUMN address_snapshot jsonb,
        ADD COLUMN carrier varchar(64),
        ADD COLUMN tracking_number varchar(128),
        ADD COLUMN shipped_at timestamptz,
        ADD COLUMN delivered_at timestamptz,
        ADD COLUMN created_at timestamptz,
        ADD COLUMN status_legacy varchar,
        ADD COLUMN status_new shippings_status_enum;

      ALTER TABLE sessions ADD COLUMN "expiresAt" timestamptz;
      ALTER TABLE refresh_tokens ADD COLUMN expires_at timestamptz;

      ALTER TABLE vouchers
        ADD COLUMN scope vouchers_scope_enum,
        ADD COLUMN starts_at timestamptz,
        ADD COLUMN min_order_amount numeric(18,2),
        ADD COLUMN max_discount numeric(18,2),
        ADD COLUMN usage_limit integer,
        ADD COLUMN per_user_limit integer,
        ADD COLUMN usage_count integer;
    `);

    await this.backfillSlug(queryRunner, 'categories', null);
    await this.backfillSlug(queryRunner, 'shops', null);
    await this.backfillSlug(queryRunner, 'products', 'shop_id');

    await queryRunner.query(`
      UPDATE products
      SET is_active = COALESCE(lower(status) = 'active', false),
          sold_count = COALESCE(sold_count, 0),
          rating_avg = COALESCE(rating_avg, 0),
          rating_count = COALESCE(rating_count, 0);

      DO $$
      BEGIN
        IF to_regclass('shop_follows') IS NOT NULL THEN
          EXECUTE $sql$
            UPDATE shops s
            SET follower_count = COALESCE((
                  SELECT count(*)::integer
                  FROM shop_follows sf
                  WHERE sf.shop_id = s.id
                ), 0),
                rating_count = 0,
                status = CASE WHEN s.is_active THEN 'active'::shops_status_enum
                              ELSE 'suspended'::shops_status_enum END
          $sql$;
        ELSE
          UPDATE shops
          SET follower_count = 0,
              rating_count = 0,
              status = CASE WHEN is_active THEN 'active'::shops_status_enum
                            ELSE 'suspended'::shops_status_enum END;
        END IF;
      END $$;

      UPDATE users SET password_hash = password;

      UPDATE orders o
      SET buyer_id = o.user_id,
          order_no = 'ORD-' || upper(substr(md5(random()::text || clock_timestamp()::text || o.id::text), 1, 24)),
          subtotal = COALESCE((
            SELECT sum(oi.price * oi.quantity) FROM order_items oi WHERE oi.order_id = o.id
          ), 0),
          shipping_fee = COALESCE((
            SELECT sum(s.shipping_fee) FROM shippings s WHERE s.order_id = o.id
          ), 0),
          currency = 'VND',
          shipping_address = (
            SELECT jsonb_build_object('legacy_address', s.address)
            FROM shippings s
            WHERE s.order_id = o.id
            ORDER BY s.id
            LIMIT 1
          ),
          payment_status = CASE
            WHEN EXISTS (
              SELECT 1 FROM payments p
              WHERE p.order_id = o.id AND lower(p.status) IN ('paid', 'succeeded', 'success')
            ) THEN 'paid'::orders_payment_status_enum
            WHEN EXISTS (
              SELECT 1 FROM payments p
              WHERE p.order_id = o.id AND lower(p.status) IN ('failed', 'error')
            ) THEN 'failed'::orders_payment_status_enum
            ELSE 'pending'::orders_payment_status_enum
          END;

      UPDATE orders
      SET discount_amount = GREATEST(0, subtotal + shipping_fee - total_amount);

      UPDATE order_items oi
      SET shop_id = p.shop_id,
          product_name = p.name,
          sku = pv.sku,
          variant_label = attrs.label,
          image_url = img.url
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      LEFT JOIN LATERAL (
        SELECT string_agg(ca.name || ': ' || COALESCE(cav.value, pva.custom_value), ', ' ORDER BY ca.name) AS label
        FROM product_variant_attributes pva
        JOIN category_attributes ca ON ca.id = pva.attribute_id
        LEFT JOIN category_attribute_values cav ON cav.id = pva.value_id
        WHERE pva.variant_id = pv.id
      ) attrs ON true
      LEFT JOIN LATERAL (
        SELECT pi.url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.is_primary DESC, pi.id
        LIMIT 1
      ) img ON true
      WHERE oi.product_variant_id = pv.id;

      UPDATE product_variants pv
      SET compare_at_price = NULL,
          attribute_signature = md5(COALESCE((
            SELECT string_agg(
              pva.attribute_id::text || '=' ||
                COALESCE(pva.value_id::text, 'custom:' || pva.custom_value, ''),
              '|' ORDER BY pva.attribute_id
            )
            FROM product_variant_attributes pva
            WHERE pva.variant_id = pv.id
          ), ''));

      UPDATE product_images pi
      SET sort_order = ranked.position
      FROM (
        SELECT id, row_number() OVER (
          PARTITION BY product_id ORDER BY is_primary DESC, id
        ) - 1 AS position
        FROM product_images
      ) ranked
      WHERE ranked.id = pi.id;

      UPDATE payments p
      SET provider = COALESCE(NULLIF(p.method, ''), 'legacy'),
          amount = COALESCE(o.total_amount, 0),
          currency = 'VND',
          created_at = COALESCE(p.paid_at, CURRENT_TIMESTAMP),
          status_legacy = p.status,
          status_new = CASE lower(trim(p.status))
            WHEN 'paid' THEN 'succeeded'::payments_status_enum
            WHEN 'success' THEN 'succeeded'::payments_status_enum
            WHEN 'succeeded' THEN 'succeeded'::payments_status_enum
            WHEN 'failed' THEN 'failed'::payments_status_enum
            WHEN 'error' THEN 'failed'::payments_status_enum
            WHEN 'cancelled' THEN 'cancelled'::payments_status_enum
            WHEN 'canceled' THEN 'cancelled'::payments_status_enum
            WHEN 'refunded' THEN 'refunded'::payments_status_enum
            ELSE 'pending'::payments_status_enum
          END
      FROM orders o
      WHERE o.id = p.order_id;

      UPDATE shippings s
      SET status_legacy = s.status,
          status_new = CASE lower(trim(s.status))
            WHEN 'ready_to_ship' THEN 'ready_to_ship'::shippings_status_enum
            WHEN 'shipping' THEN 'shipped'::shippings_status_enum
            WHEN 'shipped' THEN 'shipped'::shippings_status_enum
            WHEN 'delivered' THEN 'delivered'::shippings_status_enum
            WHEN 'failed' THEN 'failed'::shippings_status_enum
            WHEN 'returned' THEN 'returned'::shippings_status_enum
            WHEN 'cancelled' THEN 'cancelled'::shippings_status_enum
            WHEN 'canceled' THEN 'cancelled'::shippings_status_enum
            ELSE 'pending'::shippings_status_enum
          END,
          created_at = CURRENT_TIMESTAMP,
          address_snapshot = jsonb_build_object('legacy_address', s.address);

      UPDATE sessions
      SET "expiresAt" = COALESCE("lastActive", "createdAt") + interval '30 days';
      UPDATE refresh_tokens
      SET expires_at = created_at + interval '7 days';

      UPDATE vouchers
      SET scope = 'shop'::vouchers_scope_enum,
          min_order_amount = 0,
          usage_count = 0;
    `);

    await this.assertNoRows(
      queryRunner,
      'Order items without an existing product/shop mapping',
      `
        SELECT oi.id, oi.order_id, oi.product_variant_id
        FROM order_items oi
        LEFT JOIN product_variants pv ON pv.id = oi.product_variant_id
        LEFT JOIN products p ON p.id = pv.product_id
        WHERE oi.shop_id IS NULL OR p.shop_id IS NULL
        ORDER BY oi.id
        LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Products with multiple primary images',
      `
        SELECT product_id, array_agg(id ORDER BY id) AS image_ids
        FROM product_images
        WHERE is_primary = true
        GROUP BY product_id
        HAVING count(*) > 1
        ORDER BY product_id
        LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Orders without items cannot be split into shop orders',
      `
        SELECT o.id, o.order_no
        FROM orders o
        WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id)
        ORDER BY o.id
        LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Unsupported existing order statuses',
      `
        SELECT id, status FROM orders
        WHERE status IS NULL OR lower(trim(status)) NOT IN (
          'pending', 'pending_payment', 'awaiting_payment', 'unpaid',
          'paid', 'processing', 'shipped', 'shipping', 'delivered',
          'completed', 'cancelled', 'canceled', 'refund_pending',
          'refunding', 'refunded'
        )
        ORDER BY id LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Unsupported existing payment statuses',
      `
        SELECT id, status FROM payments
        WHERE status IS NULL OR lower(trim(status)) NOT IN (
          'pending', 'paid', 'success', 'succeeded', 'failed', 'error',
          'cancelled', 'canceled', 'refunded'
        )
        ORDER BY id LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Existing product ratings outside 1..5',
      `SELECT id, rating FROM product_reviews WHERE rating NOT BETWEEN 1 AND 5 ORDER BY id LIMIT 100`,
    );
    await this.assertNoRows(
      queryRunner,
      'Duplicate active account email/phone values',
      `
        SELECT 'email' AS field, lower(email) AS value, count(*)::int AS records
        FROM users WHERE deleted_at IS NULL GROUP BY lower(email) HAVING count(*) > 1
        UNION ALL
        SELECT 'phone', phone, count(*)::int
        FROM users
        WHERE deleted_at IS NULL AND phone IS NOT NULL AND phone <> ''
        GROUP BY phone HAVING count(*) > 1
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Duplicate variant attribute combinations',
      `
        SELECT product_id, attribute_signature, array_agg(id ORDER BY id) AS variant_ids
        FROM product_variants
        GROUP BY product_id, attribute_signature
        HAVING count(*) > 1
        ORDER BY product_id
        LIMIT 100
      `,
    );

    await queryRunner.query(`
      CREATE TABLE shop_orders (
        id bigserial PRIMARY KEY,
        order_id bigint NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        shop_id bigint NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
        shop_order_no varchar(48) NOT NULL,
        subtotal numeric(18,2) NOT NULL DEFAULT 0,
        shipping_fee numeric(18,2) NOT NULL DEFAULT 0,
        discount_amount numeric(18,2) NOT NULL DEFAULT 0,
        total_amount numeric(18,2) NOT NULL DEFAULT 0,
        currency char(3) NOT NULL DEFAULT 'VND',
        status shop_orders_status_enum NOT NULL DEFAULT 'pending_payment',
        shipping_status shop_orders_shipping_status_enum NOT NULL DEFAULT 'unfulfilled',
        cancelled_reason text,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_shop_orders_order_shop UNIQUE (order_id, shop_id),
        CONSTRAINT uq_shop_orders_number UNIQUE (shop_order_no),
        CONSTRAINT ck_shop_orders_amounts CHECK (
          subtotal >= 0 AND shipping_fee >= 0 AND
          discount_amount >= 0 AND total_amount >= 0
        )
      )
    `);

    await queryRunner.query(`
      INSERT INTO shop_orders (
        order_id, shop_id, shop_order_no, subtotal, total_amount, currency,
        status, shipping_status
      )
      SELECT o.id, oi.shop_id, 'SO-' || o.id::text || '-' || oi.shop_id::text,
        sum(oi.price * oi.quantity), sum(oi.price * oi.quantity), 'VND',
        CASE lower(trim(o.status))
          WHEN 'paid' THEN 'paid'::shop_orders_status_enum
          WHEN 'processing' THEN 'processing'::shop_orders_status_enum
          WHEN 'shipped' THEN 'shipped'::shop_orders_status_enum
          WHEN 'shipping' THEN 'shipped'::shop_orders_status_enum
          WHEN 'delivered' THEN 'completed'::shop_orders_status_enum
          WHEN 'completed' THEN 'completed'::shop_orders_status_enum
          WHEN 'cancelled' THEN 'cancelled'::shop_orders_status_enum
          WHEN 'canceled' THEN 'cancelled'::shop_orders_status_enum
          WHEN 'refund_pending' THEN 'refund_pending'::shop_orders_status_enum
          WHEN 'refunding' THEN 'refund_pending'::shop_orders_status_enum
          WHEN 'refunded' THEN 'refunded'::shop_orders_status_enum
          ELSE 'pending_payment'::shop_orders_status_enum
        END,
        CASE lower(trim(o.status))
          WHEN 'shipped' THEN 'shipped'::shop_orders_shipping_status_enum
          WHEN 'shipping' THEN 'shipped'::shop_orders_shipping_status_enum
          WHEN 'delivered' THEN 'delivered'::shop_orders_shipping_status_enum
          WHEN 'completed' THEN 'delivered'::shop_orders_shipping_status_enum
          WHEN 'cancelled' THEN 'cancelled'::shop_orders_shipping_status_enum
          WHEN 'canceled' THEN 'cancelled'::shop_orders_shipping_status_enum
          ELSE 'unfulfilled'::shop_orders_shipping_status_enum
        END
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, oi.shop_id, o.status
    `);

    await queryRunner.query(`
      UPDATE order_items oi
      SET shop_order_id = so.id
      FROM shop_orders so
      WHERE so.order_id = oi.order_id AND so.shop_id = oi.shop_id
    `);
    await this.assertNoRows(
      queryRunner,
      'Order items without a backfilled shop order',
      `SELECT id, order_id, shop_id FROM order_items WHERE shop_order_id IS NULL ORDER BY id LIMIT 100`,
    );

    await queryRunner.query(`
      UPDATE orders
      SET status_legacy = status,
          status_new = CASE lower(trim(status))
            WHEN 'paid' THEN 'paid'::orders_status_enum
            WHEN 'processing' THEN 'processing'::orders_status_enum
            WHEN 'shipped' THEN 'shipped'::orders_status_enum
            WHEN 'shipping' THEN 'shipped'::orders_status_enum
            WHEN 'delivered' THEN 'completed'::orders_status_enum
            WHEN 'completed' THEN 'completed'::orders_status_enum
            WHEN 'cancelled' THEN 'cancelled'::orders_status_enum
            WHEN 'canceled' THEN 'cancelled'::orders_status_enum
            WHEN 'refund_pending' THEN 'refund_pending'::orders_status_enum
            WHEN 'refunding' THEN 'refund_pending'::orders_status_enum
            WHEN 'refunded' THEN 'refunded'::orders_status_enum
            ELSE 'pending_payment'::orders_status_enum
          END;

      ALTER TABLE orders DROP COLUMN status;
      ALTER TABLE orders RENAME COLUMN status_new TO status;
      ALTER TABLE orders ALTER COLUMN buyer_id SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN order_no SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN subtotal SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN shipping_fee SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN discount_amount SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN currency SET DEFAULT 'VND';
      ALTER TABLE orders ALTER COLUMN currency SET NOT NULL;
      ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending';
      ALTER TABLE orders ALTER COLUMN payment_status SET NOT NULL;
      ALTER TABLE orders ADD CONSTRAINT fk_orders_buyer
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT;
      ALTER TABLE orders ADD CONSTRAINT uq_orders_order_no UNIQUE (order_no);
      ALTER TABLE orders ADD CONSTRAINT ck_orders_total_nonnegative CHECK (total_amount >= 0);
      CREATE INDEX idx_orders_buyer_status_created ON orders(buyer_id, status, created_at);

      ALTER TABLE order_items ALTER COLUMN shop_id SET NOT NULL;
      ALTER TABLE order_items ALTER COLUMN shop_order_id SET NOT NULL;
      ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
      ALTER TABLE order_items ALTER COLUMN sku SET NOT NULL;
      ALTER TABLE order_items ADD CONSTRAINT fk_order_items_shop
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE RESTRICT;
      ALTER TABLE order_items ADD CONSTRAINT fk_order_items_shop_order
        FOREIGN KEY (shop_order_id) REFERENCES shop_orders(id) ON DELETE RESTRICT;
      ALTER TABLE order_items ADD CONSTRAINT ck_order_items_quantity_positive CHECK (quantity > 0);
      ALTER TABLE order_items ADD CONSTRAINT ck_order_items_price_nonnegative CHECK (price >= 0);
      CREATE INDEX idx_order_items_shop_order ON order_items(shop_order_id);
      ALTER TABLE products ADD CONSTRAINT fk_products_shop
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE RESTRICT;

      ALTER TABLE product_variants ALTER COLUMN attribute_signature SET NOT NULL;
      ALTER TABLE product_variants ADD CONSTRAINT uq_product_variants_product_signature
        UNIQUE (product_id, attribute_signature);
      ALTER TABLE product_variants ADD CONSTRAINT ck_product_variants_stock_nonnegative
        CHECK (stock >= 0);
      ALTER TABLE product_images ALTER COLUMN sort_order SET DEFAULT 0;
      ALTER TABLE product_images ALTER COLUMN sort_order SET NOT NULL;
      CREATE INDEX idx_product_images_order ON product_images(product_id, sort_order);
      CREATE UNIQUE INDEX uq_product_images_primary ON product_images(product_id)
        WHERE is_primary = true;

      ALTER TABLE product_reviews
        ADD CONSTRAINT fk_product_reviews_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE RESTRICT,
        ADD CONSTRAINT ck_product_reviews_rating CHECK (rating BETWEEN 1 AND 5);
      CREATE UNIQUE INDEX uq_product_reviews_verified_order_item
        ON product_reviews(order_item_id) WHERE order_item_id IS NOT NULL;

      ALTER TABLE payments
        ALTER COLUMN provider SET NOT NULL,
        ALTER COLUMN amount SET NOT NULL,
        ALTER COLUMN currency SET NOT NULL,
        ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
        ALTER COLUMN created_at SET NOT NULL;
      ALTER TABLE payments DROP COLUMN status;
      ALTER TABLE payments RENAME COLUMN status_new TO status;
      ALTER TABLE payments ALTER COLUMN status SET DEFAULT 'pending';
      ALTER TABLE payments ALTER COLUMN status SET NOT NULL;
      ALTER TABLE payments ADD CONSTRAINT ck_payments_amount_nonnegative CHECK (amount >= 0);
      CREATE INDEX idx_payments_order_created ON payments(order_id, created_at);
      CREATE UNIQUE INDEX uq_payments_idempotency_key ON payments(idempotency_key)
        WHERE idempotency_key IS NOT NULL;
      CREATE UNIQUE INDEX uq_payments_provider_transaction
        ON payments(provider, provider_transaction_id)
        WHERE provider_transaction_id IS NOT NULL;

      ALTER TABLE shippings ALTER COLUMN order_id DROP NOT NULL;
      ALTER TABLE shippings ALTER COLUMN shop_order_id DROP NOT NULL;
      ALTER TABLE shippings ALTER COLUMN address DROP NOT NULL;
      ALTER TABLE shippings ALTER COLUMN shipping_fee TYPE numeric(18,2)
        USING shipping_fee::numeric(18,2);
      ALTER TABLE shippings ALTER COLUMN shipping_fee SET DEFAULT 0;
      ALTER TABLE shippings ALTER COLUMN shipping_fee SET NOT NULL;
      ALTER TABLE shippings ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE shippings ALTER COLUMN created_at SET NOT NULL;
      ALTER TABLE shippings DROP COLUMN status;
      ALTER TABLE shippings RENAME COLUMN status_new TO status;
      ALTER TABLE shippings ALTER COLUMN status SET DEFAULT 'pending';
      ALTER TABLE shippings ALTER COLUMN status SET NOT NULL;
      ALTER TABLE shippings ADD CONSTRAINT fk_shippings_shop_order
        FOREIGN KEY (shop_order_id) REFERENCES shop_orders(id) ON DELETE RESTRICT;
      ALTER TABLE shippings ADD CONSTRAINT ck_shippings_owner
        CHECK (num_nonnulls(order_id, shop_order_id) = 1);
      ALTER TABLE shippings ADD CONSTRAINT ck_shippings_fee_nonnegative
        CHECK (shipping_fee >= 0);
      CREATE INDEX idx_shippings_shop_order ON shippings(shop_order_id);
      CREATE UNIQUE INDEX uq_shippings_tracking_number ON shippings(tracking_number)
        WHERE tracking_number IS NOT NULL;

      CREATE TABLE order_status_history (
        id bigserial PRIMARY KEY,
        order_id bigint NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        shop_order_id bigint REFERENCES shop_orders(id) ON DELETE RESTRICT,
        actor_user_id bigint REFERENCES users(id) ON DELETE SET NULL,
        from_status varchar(32),
        to_status varchar(32) NOT NULL,
        reason text,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT ck_order_status_history_to_status CHECK (length(to_status) > 0)
      );
      CREATE INDEX idx_order_status_history_order_created
        ON order_status_history(order_id, created_at);
      CREATE INDEX idx_order_status_history_shop_order_created
        ON order_status_history(shop_order_id, created_at)
        WHERE shop_order_id IS NOT NULL;
      INSERT INTO order_status_history (order_id, from_status, to_status, reason)
      SELECT id, NULL, status::text, 'Backfilled from legacy order status'
      FROM orders;
      INSERT INTO order_status_history (
        order_id, shop_order_id, from_status, to_status, reason
      )
      SELECT order_id, id, NULL, status::text, 'Created during legacy order split'
      FROM shop_orders;

      CREATE TABLE inventory_reservations (
        id bigserial PRIMARY KEY,
        reservation_key uuid NOT NULL UNIQUE,
        order_id bigint NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        product_variant_id bigint NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
        quantity integer NOT NULL,
        status inventory_reservations_status_enum NOT NULL DEFAULT 'holding',
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT ck_inventory_reservations_quantity CHECK (quantity > 0)
      );
      CREATE INDEX idx_inventory_reservations_expiry
        ON inventory_reservations(status, expires_at);
      CREATE INDEX idx_inventory_reservations_order_status
        ON inventory_reservations(order_id, status);

      CREATE TABLE voucher_redemptions (
        id bigserial PRIMARY KEY,
        voucher_id bigint NOT NULL REFERENCES vouchers(id) ON DELETE RESTRICT,
        order_id bigint NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        user_id bigint NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        discount_amount numeric(18,2) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_voucher_redemptions_order UNIQUE (voucher_id, order_id),
        CONSTRAINT ck_voucher_redemptions_discount_nonnegative CHECK (discount_amount >= 0)
      );
      CREATE INDEX idx_voucher_redemptions_user ON voucher_redemptions(voucher_id, user_id);

      ALTER TABLE vouchers ALTER COLUMN shop_id DROP NOT NULL;
      ALTER TABLE vouchers ALTER COLUMN scope SET DEFAULT 'shop';
      ALTER TABLE vouchers ALTER COLUMN scope SET NOT NULL;
      ALTER TABLE vouchers ALTER COLUMN min_order_amount SET DEFAULT 0;
      ALTER TABLE vouchers ALTER COLUMN min_order_amount SET NOT NULL;
      ALTER TABLE vouchers ALTER COLUMN usage_count SET DEFAULT 0;
      ALTER TABLE vouchers ALTER COLUMN usage_count SET NOT NULL;
      ALTER TABLE vouchers ADD CONSTRAINT ck_vouchers_scope_shop
        CHECK ((scope = 'shop' AND shop_id IS NOT NULL) OR
               (scope = 'platform' AND shop_id IS NULL) OR scope = 'shipping');
      ALTER TABLE vouchers ADD CONSTRAINT ck_vouchers_usage_limit
        CHECK (usage_limit IS NULL OR usage_limit >= 0);
      ALTER TABLE vouchers ADD CONSTRAINT ck_vouchers_per_user_limit
        CHECK (per_user_limit IS NULL OR per_user_limit > 0);

      ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;
      ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
      ALTER TABLE products ALTER COLUMN is_active SET DEFAULT true;
      ALTER TABLE products ALTER COLUMN is_active SET NOT NULL;
      ALTER TABLE shops ALTER COLUMN slug SET NOT NULL;
      ALTER TABLE shops ALTER COLUMN follower_count SET DEFAULT 0;
      ALTER TABLE shops ALTER COLUMN follower_count SET NOT NULL;
      ALTER TABLE shops ALTER COLUMN rating_count SET DEFAULT 0;
      ALTER TABLE shops ALTER COLUMN rating_count SET NOT NULL;
      ALTER TABLE shops ALTER COLUMN status SET DEFAULT 'pending';
      ALTER TABLE shops ALTER COLUMN status SET NOT NULL;

      CREATE UNIQUE INDEX uq_categories_slug_active ON categories(slug)
        WHERE deleted_at IS NULL;
      CREATE UNIQUE INDEX uq_products_shop_slug_active ON products(shop_id, slug)
        WHERE deleted_at IS NULL;
      CREATE UNIQUE INDEX uq_shops_slug_active ON shops(slug)
        WHERE deleted_at IS NULL;
    `);

    await this.assertNoRows(
      queryRunner,
      'Duplicate active account emails/phones before partial unique indexes',
      `
        SELECT 'email' AS field, lower(email) AS value, count(*)::int AS records
        FROM users WHERE deleted_at IS NULL GROUP BY lower(email) HAVING count(*) > 1
        UNION ALL
        SELECT 'phone', phone, count(*)::int
        FROM users WHERE deleted_at IS NULL AND phone IS NOT NULL AND phone <> ''
        GROUP BY phone HAVING count(*) > 1
      `,
    );

    await queryRunner.query(`
      DO $$
      DECLARE item record;
      BEGIN
        FOR item IN
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'users'::regclass
            AND contype = 'u'
            AND pg_get_constraintdef(oid) ILIKE '%(email)%'
        LOOP
          EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', item.conname);
        END LOOP;
      END $$;
      CREATE UNIQUE INDEX uq_users_email_active ON users(lower(email))
        WHERE deleted_at IS NULL;
      CREATE UNIQUE INDEX uq_users_phone_active ON users(phone)
        WHERE deleted_at IS NULL AND phone IS NOT NULL AND phone <> '';
    `);

    await queryRunner.query(`
      DO $$
      DECLARE item record;
      BEGIN
        FOR item IN
          SELECT conname
          FROM pg_constraint
          WHERE conrelid = 'payments'::regclass
            AND contype = 'u'
            AND pg_get_constraintdef(oid) ILIKE '%(order_id)%'
        LOOP
          EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', item.conname);
        END LOOP;
      END $$;
    `);

    await queryRunner.query(`
      CREATE FUNCTION sync_users_password_compat() RETURNS trigger AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          NEW.password_hash := COALESCE(NEW.password_hash, NEW.password);
          NEW.password := COALESCE(NEW.password, NEW.password_hash);
        ELSIF NEW.password IS DISTINCT FROM OLD.password
          AND NEW.password_hash IS NOT DISTINCT FROM OLD.password_hash THEN
          NEW.password_hash := NEW.password;
        ELSIF NEW.password_hash IS DISTINCT FROM OLD.password_hash
          AND NEW.password IS NOT DISTINCT FROM OLD.password THEN
          NEW.password := NEW.password_hash;
        ELSIF NEW.password IS DISTINCT FROM NEW.password_hash THEN
          RAISE EXCEPTION 'password and password_hash changed to conflicting values';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      CREATE TRIGGER trg_users_password_compat
        BEFORE INSERT OR UPDATE OF password, password_hash ON users
        FOR EACH ROW EXECUTE FUNCTION sync_users_password_compat();
    `);

    await this.assertNoRows(
      queryRunner,
      'Sessions without a matching user cannot be constrained',
      `
        SELECT s.id, s."userId"
        FROM sessions s
        LEFT JOIN users u ON u.id = s."userId"
        WHERE u.id IS NULL
        ORDER BY s.id
        LIMIT 100
      `,
    );

    await queryRunner.query(`
      ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
      ALTER TABLE refresh_tokens ALTER COLUMN expires_at SET NOT NULL;
      CREATE UNIQUE INDEX uq_refresh_tokens_jti ON refresh_tokens(jti);
      CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await this.assertNoRows(
      queryRunner,
      'Cannot restore global email uniqueness while duplicate emails exist',
      `
        SELECT lower(email) AS normalized_email, count(*)::int AS records
        FROM users
        GROUP BY lower(email)
        HAVING count(*) > 1
        ORDER BY lower(email)
        LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Cannot restore one-payment-per-order while retry attempts exist',
      `
        SELECT order_id, count(*)::int AS payment_count
        FROM payments
        GROUP BY order_id
        HAVING count(*) > 1
        ORDER BY order_id
        LIMIT 100
      `,
    );
    await this.assertNoRows(
      queryRunner,
      'Cannot restore legacy shipping address for new shipments',
      `
        SELECT id FROM shippings
        WHERE address IS NULL
          AND COALESCE(address_snapshot ->> 'legacy_address', '') = ''
        ORDER BY id
        LIMIT 100
      `,
    );
    await queryRunner.query(`
      UPDATE shippings
      SET address = COALESCE(address, address_snapshot ->> 'legacy_address');
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_users_password_compat ON users;
      DROP FUNCTION IF EXISTS sync_users_password_compat();

      DROP TABLE IF EXISTS voucher_redemptions;
      DROP TABLE IF EXISTS inventory_reservations;
      DROP TABLE IF EXISTS order_status_history;
      DROP TABLE IF EXISTS shop_orders;

      DROP INDEX IF EXISTS uq_refresh_tokens_jti;
      DROP INDEX IF EXISTS idx_refresh_tokens_expires;
      ALTER TABLE sessions DROP CONSTRAINT IF EXISTS fk_sessions_user;
      ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS expires_at;

      ALTER TABLE vouchers
        DROP CONSTRAINT IF EXISTS ck_vouchers_scope_shop,
        DROP CONSTRAINT IF EXISTS ck_vouchers_usage_limit,
        DROP CONSTRAINT IF EXISTS ck_vouchers_per_user_limit,
        DROP COLUMN IF EXISTS scope,
        DROP COLUMN IF EXISTS starts_at,
        DROP COLUMN IF EXISTS min_order_amount,
        DROP COLUMN IF EXISTS max_discount,
        DROP COLUMN IF EXISTS usage_limit,
        DROP COLUMN IF EXISTS per_user_limit,
        DROP COLUMN IF EXISTS usage_count;

      ALTER TABLE shippings
        DROP CONSTRAINT IF EXISTS ck_shippings_owner,
        DROP CONSTRAINT IF EXISTS ck_shippings_fee_nonnegative,
        DROP CONSTRAINT IF EXISTS fk_shippings_shop_order,
        DROP COLUMN IF EXISTS shop_order_id,
        DROP COLUMN IF EXISTS address_snapshot,
        DROP COLUMN IF EXISTS carrier,
        DROP COLUMN IF EXISTS tracking_number,
        DROP COLUMN IF EXISTS shipped_at,
        DROP COLUMN IF EXISTS delivered_at,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS status,
        RENAME COLUMN status_legacy TO status;
      ALTER TABLE shippings ALTER COLUMN order_id SET NOT NULL;
      ALTER TABLE shippings ALTER COLUMN address SET NOT NULL;
      ALTER TABLE shippings ALTER COLUMN shipping_fee TYPE numeric
        USING shipping_fee::numeric;

      DROP INDEX IF EXISTS uq_payments_idempotency_key;
      DROP INDEX IF EXISTS uq_payments_provider_transaction;
      DROP INDEX IF EXISTS idx_payments_order_created;
      ALTER TABLE payments
        DROP CONSTRAINT IF EXISTS ck_payments_amount_nonnegative,
        DROP COLUMN IF EXISTS provider,
        DROP COLUMN IF EXISTS provider_transaction_id,
        DROP COLUMN IF EXISTS idempotency_key,
        DROP COLUMN IF EXISTS amount,
        DROP COLUMN IF EXISTS currency,
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS failure_reason,
        DROP COLUMN IF EXISTS status,
        RENAME COLUMN status_legacy TO status;
      CREATE UNIQUE INDEX uq_payments_order_legacy ON payments(order_id);

      ALTER TABLE product_reviews
        DROP CONSTRAINT IF EXISTS fk_product_reviews_order_item,
        DROP CONSTRAINT IF EXISTS ck_product_reviews_rating;
      DROP INDEX IF EXISTS uq_product_reviews_verified_order_item;
      ALTER TABLE product_reviews
        DROP COLUMN IF EXISTS order_item_id,
        DROP COLUMN IF EXISTS shop_reply,
        DROP COLUMN IF EXISTS shop_replied_at;

      DROP INDEX IF EXISTS uq_product_images_primary;
      DROP INDEX IF EXISTS idx_product_images_order;
      ALTER TABLE product_images DROP COLUMN IF EXISTS sort_order;

      ALTER TABLE product_variants
        DROP CONSTRAINT IF EXISTS uq_product_variants_product_signature,
        DROP CONSTRAINT IF EXISTS ck_product_variants_stock_nonnegative,
        DROP COLUMN IF EXISTS compare_at_price,
        DROP COLUMN IF EXISTS attribute_signature;

      ALTER TABLE order_items
        DROP CONSTRAINT IF EXISTS fk_order_items_shop,
        DROP CONSTRAINT IF EXISTS fk_order_items_shop_order,
        DROP CONSTRAINT IF EXISTS ck_order_items_quantity_positive,
        DROP CONSTRAINT IF EXISTS ck_order_items_price_nonnegative,
        DROP COLUMN IF EXISTS shop_id,
        DROP COLUMN IF EXISTS shop_order_id,
        DROP COLUMN IF EXISTS product_name,
        DROP COLUMN IF EXISTS sku,
        DROP COLUMN IF EXISTS variant_label,
        DROP COLUMN IF EXISTS image_url;

      ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS fk_orders_buyer,
        DROP CONSTRAINT IF EXISTS uq_orders_order_no,
        DROP CONSTRAINT IF EXISTS ck_orders_total_nonnegative;
      DROP INDEX IF EXISTS idx_orders_buyer_status_created;
      ALTER TABLE orders
        DROP COLUMN IF EXISTS buyer_id,
        DROP COLUMN IF EXISTS order_no,
        DROP COLUMN IF EXISTS shipping_address,
        DROP COLUMN IF EXISTS subtotal,
        DROP COLUMN IF EXISTS shipping_fee,
        DROP COLUMN IF EXISTS discount_amount,
        DROP COLUMN IF EXISTS currency,
        DROP COLUMN IF EXISTS payment_status,
        DROP COLUMN IF EXISTS cancelled_reason,
        DROP COLUMN IF EXISTS cancelled_at,
        DROP COLUMN IF EXISTS status,
        RENAME COLUMN status_legacy TO status;

      ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_shop;
      ALTER TABLE products ALTER COLUMN shop_id TYPE integer USING shop_id::integer;
      ALTER TABLE products ADD CONSTRAINT fk_products_shop_legacy
        FOREIGN KEY (shop_id) REFERENCES shops(id);
      ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
      DROP INDEX IF EXISTS uq_users_email_active;
      DROP INDEX IF EXISTS uq_users_phone_active;
      ALTER TABLE users
        ADD CONSTRAINT uq_users_email_legacy UNIQUE (email);

      DROP INDEX IF EXISTS uq_categories_slug_active;
      DROP INDEX IF EXISTS uq_products_shop_slug_active;
      DROP INDEX IF EXISTS uq_shops_slug_active;
      ALTER TABLE categories DROP COLUMN IF EXISTS slug, DROP COLUMN IF EXISTS deleted_at;
      ALTER TABLE products
        DROP COLUMN IF EXISTS slug,
        DROP COLUMN IF EXISTS is_active,
        DROP COLUMN IF EXISTS deleted_at;
      ALTER TABLE shops
        DROP COLUMN IF EXISTS slug,
        DROP COLUMN IF EXISTS follower_count,
        DROP COLUMN IF EXISTS rating_count,
        DROP COLUMN IF EXISTS status,
        DROP COLUMN IF EXISTS deleted_at;

      DROP TYPE IF EXISTS inventory_reservations_status_enum;
      DROP TYPE IF EXISTS vouchers_scope_enum;
      DROP TYPE IF EXISTS shippings_status_enum;
      DROP TYPE IF EXISTS payments_status_enum;
      DROP TYPE IF EXISTS shop_orders_shipping_status_enum;
      DROP TYPE IF EXISTS shop_orders_status_enum;
      DROP TYPE IF EXISTS orders_payment_status_enum;
      DROP TYPE IF EXISTS orders_status_enum;
      DROP TYPE IF EXISTS shops_status_enum;
    `);
  }
}
