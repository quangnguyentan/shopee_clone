from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from app.api.dependencies import (
    get_recommendation_repository,
    get_recommendation_service,
)
from app.repositories.recommendation_repository import RecommendationRepository
from app.schemas.product import (
    CartRecommendationRequest,
    ProductRecommendation,
)
from app.services.recommendation_service import (
    ProductNotFoundError,
    RecommendationService,
)

router = APIRouter(tags=["recommendations"])


@router.get(
    "/recommend/keyword",
    response_model=list[ProductRecommendation],
)
def recommend_for_keyword(
    repository: Annotated[
        RecommendationRepository, Depends(get_recommendation_repository)
    ],
    service: Annotated[RecommendationService, Depends(get_recommendation_service)],
    q: Annotated[str, Query(min_length=1, max_length=200)],
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
) -> list[ProductRecommendation]:
    return service.get_keyword_recommendations(q, repository, limit=limit)


@router.get(
    "/recommend/{product_id}",
    response_model=list[ProductRecommendation],
)
def recommend_products(
    product_id: Annotated[int, Path(gt=0)],
    repository: Annotated[
        RecommendationRepository, Depends(get_recommendation_repository)
    ],
    service: Annotated[RecommendationService, Depends(get_recommendation_service)],
    min_price: Annotated[float | None, Query(ge=0)] = None,
    max_price: Annotated[float | None, Query(ge=0)] = None,
    exclude_same_shop: bool = False,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
) -> list[ProductRecommendation]:
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=422,
            detail="min_price must be less than or equal to max_price",
        )

    try:
        return service.get_similar_products(
            product_id,
            repository,
            min_price=min_price,
            max_price=max_price,
            exclude_same_shop=exclude_same_shop,
            limit=limit,
        )
    except ProductNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail="Sản phẩm không tồn tại hoặc không còn kinh doanh",
        ) from error


@router.post(
    "/recommend/cart",
    response_model=list[ProductRecommendation],
)
def recommend_cart_products(
    request: CartRecommendationRequest,
    repository: Annotated[
        RecommendationRepository, Depends(get_recommendation_repository)
    ],
    service: Annotated[RecommendationService, Depends(get_recommendation_service)],
    limit: Annotated[int, Query(ge=1, le=10)] = 10,
) -> list[ProductRecommendation]:
    return service.get_cart_recommendations(
        request.product_ids,
        repository,
        limit=limit,
    )


@router.get(
    "/recommend/user/{user_id}",
    response_model=list[ProductRecommendation],
)
def recommend_for_user(
    user_id: Annotated[int, Path(gt=0)],
    repository: Annotated[
        RecommendationRepository, Depends(get_recommendation_repository)
    ],
    service: Annotated[RecommendationService, Depends(get_recommendation_service)],
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
) -> list[ProductRecommendation]:
    return service.get_user_recommendations(user_id, repository, limit=limit)
