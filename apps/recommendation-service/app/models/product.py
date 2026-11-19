from __future__ import annotations

from sqlalchemy import BigInteger, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    shop_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price_min: Mapped[float] = mapped_column(Numeric(asdecimal=False), nullable=False)
    price_max: Mapped[float] = mapped_column(Numeric(asdecimal=False), nullable=False)
    sold_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    status: Mapped[str] = mapped_column(
        String, nullable=False, server_default="active"
    )
    category_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("categories.id"), nullable=True
    )
    category: Mapped[Category | None] = relationship(
        back_populates="products"
    )
    variants: Mapped[list[ProductVariant]] = relationship(back_populates="product")
