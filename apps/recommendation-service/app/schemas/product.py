from pydantic import BaseModel, Field
from pydantic.types import PositiveInt


class RecommendationQuery(BaseModel):
    limit: int = Field(default=10, ge=1, le=100)


class CartRecommendationRequest(BaseModel):
    product_ids: list[PositiveInt] = Field(max_length=100)


class ProductRecommendation(BaseModel):
    product_id: int
    product_name: str
    score: float = Field(ge=0, le=1)
