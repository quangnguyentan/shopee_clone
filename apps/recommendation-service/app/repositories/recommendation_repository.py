from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.order_status import PURCHASED_ORDER_STATUSES
from app.models import Order, OrderItem, Product, ProductVariant, SearchLog
from app.repositories.product_repository import ProductRepository


class RecommendationRepository(ProductRepository):
    def __init__(self, session: Session) -> None:
        super().__init__(session)

    def list_active_products(self) -> list[Product]:
        statement = (
            select(Product)
            .options(joinedload(Product.category))
            .where(Product.status == "active")
            .order_by(Product.id)
        )
        return list(self._session.scalars(statement).all())

    def get_successfully_purchased_product_ids(self, user_id: int) -> set[int]:
        statement = (
            select(ProductVariant.product_id)
            .select_from(OrderItem)
            .join(Order, Order.id == OrderItem.order_id)
            .join(
                ProductVariant,
                ProductVariant.id == OrderItem.product_variant_id,
            )
            .where(
                Order.user_id == user_id,
                Order.status.in_(PURCHASED_ORDER_STATUSES),
            )
            .distinct()
        )
        return set(self._session.scalars(statement).all())

    def get_search_keywords_for_user(
        self, user_id: int, limit: int = 50
    ) -> list[str]:
        statement = (
            select(SearchLog.keyword)
            .where(SearchLog.user_id == user_id)
            .order_by(SearchLog.created_at.desc(), SearchLog.id.desc())
            .limit(limit)
        )
        return list(self._session.scalars(statement).all())

    def get_best_sellers(
        self, limit: int, excluded_product_ids: set[int] | None = None
    ) -> list[Product]:
        statement = (
            select(Product)
            .options(joinedload(Product.category))
            .where(Product.status == "active")
        )
        if excluded_product_ids:
            statement = statement.where(Product.id.not_in(excluded_product_ids))
        statement = statement.order_by(
            Product.sold_count.desc(), Product.id.asc()
        ).limit(limit)
        return list(self._session.scalars(statement).all())
