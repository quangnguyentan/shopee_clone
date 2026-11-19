from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Category


class CategoryRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, category_id: int) -> Category | None:
        return self._session.get(Category, category_id)

    def list_all(self) -> list[Category]:
        statement = select(Category).order_by(Category.id)
        return list(self._session.scalars(statement).all())
