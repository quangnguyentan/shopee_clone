import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models import (
    Base,
    Category,
    Order,
    OrderItem,
    Product,
    ProductVariant,
    SearchLog,
)
from app.repositories.recommendation_repository import RecommendationRepository


class RecommendationRepositoryTests(unittest.TestCase):
    def test_product_categories_purchases_and_searches_use_confirmed_schema(self):
        engine = create_engine("sqlite://")
        Base.metadata.create_all(engine)

        with Session(engine) as session:
            category = Category(id=10, name="Điện thoại")
            product = Product(
                id=100,
                shop_id=7,
                name="Điện thoại Alpha",
                description="camera",
                price_min=100,
                price_max=200,
                sold_count=12,
                status="active",
                category=category,
            )
            variant = ProductVariant(
                id=200,
                product=product,
                sku="PHONE-1",
                price=100,
                stock=5,
            )
            delivered_order = Order(
                id=300,
                user_id=42,
                total_amount=100,
                status="delivered",
                items=[
                    OrderItem(
                        id=400,
                        product_variant=variant,
                        price=100,
                        quantity=1,
                    )
                ],
            )
            cancelled_order = Order(
                id=301,
                user_id=42,
                total_amount=100,
                status="cancelled",
                items=[
                    OrderItem(
                        id=401,
                        product_variant=variant,
                        price=100,
                        quantity=1,
                    )
                ],
            )
            session.add_all(
                [
                    delivered_order,
                    cancelled_order,
                    SearchLog(id=1, user_id=42, keyword="camera"),
                    SearchLog(id=2, user_id=99, keyword="laptop"),
                ]
            )
            session.commit()

            repository = RecommendationRepository(session)
            loaded_products = repository.list_active_products()

            self.assertEqual(loaded_products[0].category.name, "Điện thoại")
            self.assertEqual(
                repository.get_successfully_purchased_product_ids(42),
                {100},
            )
            self.assertEqual(
                repository.get_search_keywords_for_user(42),
                ["camera"],
            )
            self.assertEqual(
                [
                    product.id
                    for product in repository.get_best_sellers(
                        10, excluded_product_ids={100}
                    )
                ],
                [],
            )

        engine.dispose()


if __name__ == "__main__":
    unittest.main()
