-- Run against the same database before applying the migration.
-- An empty result means every current order item can be assigned to a shop.
SELECT
  oi.id AS order_item_id,
  oi.order_id,
  oi.product_variant_id,
  pv.product_id,
  p.shop_id
FROM order_items oi
LEFT JOIN product_variants pv ON pv.id = oi.product_variant_id
LEFT JOIN products p ON p.id = pv.product_id
WHERE pv.id IS NULL
   OR p.id IS NULL
   OR p.shop_id IS NULL
ORDER BY oi.id;

-- Orders with no items cannot produce a ShopOrder.
SELECT o.id AS order_id
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
)
ORDER BY o.id;

-- Existing sessions must reference a user before the migration adds its FK.
SELECT s.id AS session_id, s."userId" AS user_id
FROM sessions s
LEFT JOIN users u ON u.id = s."userId"
WHERE u.id IS NULL
ORDER BY s.id;

-- The migration will stop if an order item has no valid product/shop mapping,
-- if an order has no items, if a session has no user, or if another assertion fails.
