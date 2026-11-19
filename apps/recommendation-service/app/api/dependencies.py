from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.repositories.recommendation_repository import RecommendationRepository
from app.services.recommendation_service import RecommendationService


def get_recommendation_repository(
    session: Annotated[Session, Depends(get_db)],
) -> RecommendationRepository:
    return RecommendationRepository(session)


@lru_cache
def get_recommendation_service() -> RecommendationService:
    return RecommendationService(
        cache_ttl_seconds=get_settings().recommendation_cache_ttl_seconds
    )
