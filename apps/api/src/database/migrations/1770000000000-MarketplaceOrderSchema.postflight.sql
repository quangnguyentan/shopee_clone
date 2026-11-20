-- Run after migration:run. Each result should be zero unless noted otherwise.
SELECT 'categories_missing_slug' AS check_name, count(*) AS failures
FROM categories WHERE slug IS NULL
UNION ALL
SELECT 'products_missing_slug', count(*) FROM products WHERE slug IS NULL
UNION ALL
SELECT 'shops_missing_slug', count(*) FROM shops WHERE slug IS NULL
UNION ALL
SELECT 'products_missing_active_flag', count(*) FROM products WHERE is_active IS NULL
UNION ALL
SELECT 'order_items_missing_shop_order', count(*)
FROM order_items oi
LEFT JOIN shop_orders so ON so.id = oi.shop_order_id
WHERE so.id IS NULL OR so.order_id <> oi.order_id OR so.shop_id <> oi.shop_id
UNION ALL
SELECT 'orders_without_shop_orders', count(*)
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM shop_orders so WHERE so.order_id = o.id)
UNION ALL
SELECT 'orders_without_buyer', count(*)
FROM orders o
LEFT JOIN users u ON u.id = o.buyer_id
WHERE u.id IS NULL;

-- Each query below should return no rows.
SELECT slug, count(*) AS duplicates
FROM categories
WHERE deleted_at IS NULL
GROUP BY slug
HAVING count(*) > 1;

SELECT shop_id, slug, count(*) AS duplicates
FROM products
WHERE deleted_at IS NULL
GROUP BY shop_id, slug
HAVING count(*) > 1;

SELECT slug, count(*) AS duplicates
FROM shops
WHERE deleted_at IS NULL
GROUP BY slug
HAVING count(*) > 1;

SELECT lower(email) AS normalized_email, count(*) AS duplicates
FROM users
WHERE deleted_at IS NULL
GROUP BY lower(email)
HAVING count(*) > 1;

SELECT order_item_id, count(*) AS duplicate_reviews
FROM product_reviews
WHERE order_item_id IS NOT NULL
GROUP BY order_item_id
HAVING count(*) > 1;
