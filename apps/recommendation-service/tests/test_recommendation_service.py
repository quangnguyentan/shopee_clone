import unittest
from dataclasses import dataclass
from unittest.mock import patch

from app.services.recommendation_service import (
    ProductNotFoundError,
    RecommendationService,
    preprocess_text,
)


@dataclass
class Category:
    id: int
    name: str


@dataclass
class Product:
    id: int
    name: str
    description: str
    category_id: int
    category: Category
    shop_id: int
    price_min: float
    price_max: float
    sold_count: int
    status: str = "active"


class InMemoryRecommendationRepository:
    def __init__(self) -> None:
        self.load_count = 0
        self.products = [
            Product(
                1, "Điện thoại Alpha", "camera tốt", 1, Category(1, "Điện thoại"),
                10, 100, 120, 100,
            ),
            Product(
                2, "Điện thoại Beta", "camera đẹp", 1, Category(1, "Điện thoại"),
                10, 130, 150, 80,
            ),
            Product(
                3, "Ốp lưng Alpha", "bảo vệ máy", 2, Category(2, "Ốp lưng"),
                11, 20, 40, 60,
            ),
            Product(
                4, "Máy ảnh", "camera zoom", 3, Category(3, "Máy ảnh"),
                12, 200, 300, 90,
            ),
            Product(
                5, "Chuối", "trái cây tươi", 4, Category(4, "Thực phẩm"),
                13, 5, 10, 200,
            ),
        ]
        self.purchased_ids: set[int] = set()
        self.search_keywords: list[str] = []

    def list_active_products(self) -> list[Product]:
        self.load_count += 1
        return [product for product in self.products if product.status == "active"]

    def get_successfully_purchased_product_ids(self, user_id: int) -> set[int]:
        return self.purchased_ids

    def get_search_keywords_for_user(self, user_id: int) -> list[str]:
        return self.search_keywords

    def get_best_sellers(
        self, limit: int, excluded_product_ids: set[int] | None = None
    ) -> list[Product]:
        excluded = excluded_product_ids or set()
        return [
            product
            for product in sorted(
                self.products, key=lambda item: (-item.sold_count, item.id)
            )
            if product.status == "active" and product.id not in excluded
        ][:limit]


class RecommendationServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = InMemoryRecommendationRepository()
        self.service = RecommendationService(cache_ttl_seconds=60)

    def test_vietnamese_preprocessing_and_field_weights(self) -> None:
        self.assertEqual(preprocess_text("  ĐIỆN-thoại! "), "điện thoại")
        content = self.service._build_product_content(
            "Điện thoại Alpha", "camera tốt", "Điện thoại"
        )

        self.assertEqual(content.count("điện thoại"), 5)
        self.assertIn("camera tốt", content)

    def test_similar_products_apply_price_and_shop_filters(self) -> None:
        recommendations = self.service.get_similar_products(
            1,
            self.repository,
            min_price=100,
            max_price=200,
            exclude_same_shop=True,
        )

        self.assertEqual([item.product_id for item in recommendations], [4])

    def test_cart_recommendations_prioritize_accessories(self) -> None:
        recommendations = self.service.get_cart_recommendations(
            [1, 2], self.repository, limit=3
        )

        self.assertEqual(recommendations[0].product_id, 3)
        self.assertNotIn(1, [item.product_id for item in recommendations])
        self.assertNotIn(2, [item.product_id for item in recommendations])

    def test_user_profile_excludes_purchased_items_and_uses_searches(self) -> None:
        self.repository.purchased_ids = {1}
        self.repository.search_keywords = ["camera"]

        recommendations = self.service.get_user_recommendations(
            42, self.repository
        )

        self.assertNotIn(1, [item.product_id for item in recommendations])
        self.assertEqual(recommendations[0].product_id, 2)

    def test_new_user_falls_back_to_best_sellers(self) -> None:
        recommendations = self.service.get_user_recommendations(
            42, self.repository
        )

        self.assertEqual(recommendations[0].product_id, 5)
        self.assertEqual(recommendations[0].score, 0)

    def test_keyword_vector_uses_catalog_vocabulary(self) -> None:
        recommendations = self.service.get_keyword_recommendations(
            "camera", self.repository
        )

        self.assertTrue(recommendations)
        self.assertGreater(recommendations[0].score, 0)

    def test_catalog_cache_is_reused_and_missing_product_is_reported(self) -> None:
        self.service.get_similar_products(1, self.repository)
        self.service.get_similar_products(1, self.repository)
        self.assertEqual(self.repository.load_count, 1)

        with self.assertRaises(ProductNotFoundError):
            self.service.get_similar_products(999, self.repository)

    def test_expired_catalog_is_reloaded(self) -> None:
        repository = InMemoryRecommendationRepository()
        service = RecommendationService(cache_ttl_seconds=10)

        with patch(
            "app.services.recommendation_service.time.monotonic",
            side_effect=[0.0, 0.0, 5.0, 11.0, 11.0],
        ):
            service.get_similar_products(1, repository)
            service.get_similar_products(1, repository)
            service.get_similar_products(1, repository)

        self.assertEqual(repository.load_count, 2)


if __name__ == "__main__":
    unittest.main()
