from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Product


class ProductRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, product_id: int) -> Product | None:
        statement = (
            select(Product)
            .options(joinedload(Product.category))
            .where(Product.id == product_id)
        )
        return self._session.scalars(statement).first()

    def list_with_categories(self) -> list[Product]:
        statement = (
            select(Product)
            .options(joinedload(Product.category))
            .order_by(Product.id)
        )
        return list(self._session.scalars(statement).all())
