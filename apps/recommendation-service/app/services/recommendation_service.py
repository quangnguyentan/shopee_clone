from __future__ import annotations

import html
import re
import threading
import time
import unicodedata
from dataclasses import dataclass

from scipy.sparse import csr_matrix, vstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.repositories.recommendation_repository import RecommendationRepository
from app.schemas.product import ProductRecommendation


class ProductNotFoundError(Exception):
    def __init__(self, product_id: int) -> None:
        self.product_id = product_id
        super().__init__(f"Product {product_id} does not exist")


@dataclass(frozen=True)
class _IndexedProduct:
    product_id: int
    name: str
    category_id: int | None
    category_name: str
    shop_id: int
    price_min: float
    price_max: float
    sold_count: int
    content: str


@dataclass(frozen=True)
class _CatalogIndex:
    products: tuple[_IndexedProduct, ...]
    product_positions: dict[int, int]
    vectorizer: TfidfVectorizer
    matrix: csr_matrix | None


def preprocess_text(value: str | None) -> str:
    text = unicodedata.normalize("NFC", html.unescape(value or ""))
    text = re.sub(r"<[^>]*>", " ", text)
    text = text.lower()
    return re.sub(r"[\W_]+", " ", text, flags=re.UNICODE).strip()


class RecommendationService:
    _PHONE_CATEGORY_TERMS = ("điện thoại", "smartphone", "mobile")
    _PHONE_ACCESSORY_TERMS = (
        "ốp",
        "bao da",
        "sạc",
        "cáp",
        "tai nghe",
        "phụ kiện",
        "phụ kiện điện thoại",
        "case",
        "charger",
        "power bank",
        "cable",
        "earphone",
    )
    _GENERAL_ACCESSORY_TERMS = (
        "phụ kiện",
        "accessory",
        "accessories",
        "case",
        "cover",
        "charger",
        "power bank",
        "cable",
        "earphone",
    )

    def __init__(self, cache_ttl_seconds: int = 300) -> None:
        if cache_ttl_seconds < 0:
            raise ValueError("cache_ttl_seconds must be zero or greater")

        self._cache_ttl_seconds = cache_ttl_seconds
        self._cache: _CatalogIndex | None = None
        self._cached_at = 0.0
        self._cache_lock = threading.Lock()

    def get_similar_products(
        self,
        product_id: int,
        repository: RecommendationRepository,
        *,
        min_price: float | None = None,
        max_price: float | None = None,
        exclude_same_shop: bool = False,
        limit: int = 10,
    ) -> list[ProductRecommendation]:
        self._validate_limit(limit)
        if min_price is not None and max_price is not None and min_price > max_price:
            raise ValueError("min_price must be less than or equal to max_price")

        catalog = self._get_catalog_index(repository)
        source_position = catalog.product_positions.get(product_id)
        if source_position is None:
            raise ProductNotFoundError(product_id)
        if catalog.matrix is None:
            return []

        source = catalog.products[source_position]
        candidate_positions = self._eligible_positions(
            catalog,
            excluded_product_ids={product_id},
            min_price=min_price,
            max_price=max_price,
            excluded_shop_id=source.shop_id if exclude_same_shop else None,
        )
        return self._rank_products(
            catalog,
            catalog.matrix[source_position],
            candidate_positions,
            limit,
        )

    def get_cart_recommendations(
        self,
        product_ids: list[int],
        repository: RecommendationRepository,
        *,
        limit: int = 10,
    ) -> list[ProductRecommendation]:
        self._validate_limit(limit)
        source_ids = set(product_ids)
        if not source_ids:
            return []

        catalog = self._get_catalog_index(repository)
        source_positions = [
            catalog.product_positions[product_id]
            for product_id in source_ids
            if product_id in catalog.product_positions
        ]
        if not source_positions or catalog.matrix is None:
            return []

        source_products = [catalog.products[position] for position in source_positions]
        source_category_ids = {
            product.category_id
            for product in source_products
            if product.category_id is not None
        }
        source_category_names = {
            preprocess_text(product.category_name)
            for product in source_products
            if product.category_name
        }

        profile = csr_matrix(catalog.matrix[source_positions].mean(axis=0))
        candidate_positions = self._eligible_positions(
            catalog,
            excluded_product_ids=source_ids,
        )
        accessory_positions = [
            position
            for position in candidate_positions
            if self._is_accessory(
                source_category_names,
                catalog.products[position].category_name,
            )
        ]
        same_category_positions = [
            position
            for position in candidate_positions
            if catalog.products[position].category_id in source_category_ids
        ]

        if accessory_positions:
            accessory_recommendations = self._rank_products(
                catalog, profile, accessory_positions, limit
            )
            accessory_ids = {
                recommendation.product_id for recommendation in accessory_recommendations
            }
            remaining_limit = limit - len(accessory_recommendations)
            if remaining_limit <= 0:
                return accessory_recommendations

            same_category_positions = [
                position
                for position in same_category_positions
                if catalog.products[position].product_id not in accessory_ids
            ]
            return accessory_recommendations + self._rank_products(
                catalog, profile, same_category_positions, remaining_limit
            )

        return self._rank_products(
            catalog, profile, same_category_positions, limit
        )

    def get_user_recommendations(
        self,
        user_id: int,
        repository: RecommendationRepository,
        *,
        limit: int = 10,
    ) -> list[ProductRecommendation]:
        self._validate_limit(limit)
        catalog = self._get_catalog_index(repository)
        purchased_ids = repository.get_successfully_purchased_product_ids(user_id)
        if catalog.matrix is None or catalog.vectorizer is None:
            return self._best_seller_recommendations(
                repository, limit, purchased_ids
            )

        profile_rows: list[csr_matrix] = []
        for product_id in purchased_ids:
            position = catalog.product_positions.get(product_id)
            if position is not None:
                profile_rows.append(catalog.matrix[position])

        keywords = repository.get_search_keywords_for_user(user_id)
        if keywords:
            normalized_keywords = [preprocess_text(keyword) for keyword in keywords]
            keyword_vectors = catalog.vectorizer.transform(normalized_keywords)
            profile_rows.extend(
                keyword_vectors[index]
                for index in range(keyword_vectors.shape[0])
                if keyword_vectors[index].nnz
            )

        if not profile_rows:
            return self._best_seller_recommendations(
                repository, limit, purchased_ids
            )

        profile = csr_matrix(vstack(profile_rows).mean(axis=0))
        candidate_positions = self._eligible_positions(
            catalog,
            excluded_product_ids=purchased_ids,
        )
        recommendations = self._rank_products(
            catalog,
            profile,
            candidate_positions,
            limit,
            positive_scores_only=True,
        )
        if recommendations:
            return recommendations
        return self._best_seller_recommendations(repository, limit, purchased_ids)

    def get_keyword_recommendations(
        self,
        keyword: str,
        repository: RecommendationRepository,
        *,
        limit: int = 10,
    ) -> list[ProductRecommendation]:
        self._validate_limit(limit)
        catalog = self._get_catalog_index(repository)
        if catalog.matrix is None or catalog.vectorizer is None:
            return []

        normalized_keyword = preprocess_text(keyword)
        if not normalized_keyword:
            return []
        keyword_vector = catalog.vectorizer.transform([normalized_keyword])
        if not keyword_vector.nnz:
            return []

        return self._rank_products(
            catalog,
            keyword_vector,
            range(len(catalog.products)),
            limit,
            positive_scores_only=True,
        )

    def _get_catalog_index(
        self, repository: RecommendationRepository
    ) -> _CatalogIndex:
        with self._cache_lock:
            now = time.monotonic()
            if (
                self._cache is not None
                and now - self._cached_at < self._cache_ttl_seconds
            ):
                return self._cache

            products = tuple(
                _IndexedProduct(
                    product_id=product.id,
                    name=product.name or "",
                    category_id=product.category_id,
                    category_name=product.category.name if product.category else "",
                    shop_id=product.shop_id,
                    price_min=float(product.price_min),
                    price_max=float(product.price_max),
                    sold_count=product.sold_count,
                    content=self._build_product_content(
                        product.name,
                        product.description,
                        product.category.name if product.category else "",
                    ),
                )
                for product in repository.list_active_products()
            )
            vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")
            analyzer = vectorizer.build_analyzer()
            has_terms = any(analyzer(product.content) for product in products)
            matrix = (
                vectorizer.fit_transform([product.content for product in products])
                if has_terms
                else None
            )
            catalog = _CatalogIndex(
                products=products,
                product_positions={
                    product.product_id: position
                    for position, product in enumerate(products)
                },
                vectorizer=vectorizer,
                matrix=matrix,
            )
            self._cache = catalog
            self._cached_at = time.monotonic()
            return catalog

    @staticmethod
    def _build_product_content(
        name: str | None, description: str | None, category_name: str | None
    ) -> str:
        weighted_fields = (
            [preprocess_text(name)] * 3
            + [preprocess_text(description)]
            + [preprocess_text(category_name)] * 2
        )
        return " ".join(field for field in weighted_fields if field)

    @staticmethod
    def _validate_limit(limit: int) -> None:
        if not 1 <= limit <= 100:
            raise ValueError("limit must be between 1 and 100")

    @staticmethod
    def _eligible_positions(
        catalog: _CatalogIndex,
        *,
        excluded_product_ids: set[int],
        min_price: float | None = None,
        max_price: float | None = None,
        excluded_shop_id: int | None = None,
    ) -> list[int]:
        return [
            position
            for position, product in enumerate(catalog.products)
            if product.product_id not in excluded_product_ids
            and (min_price is None or product.price_max >= min_price)
            and (max_price is None or product.price_min <= max_price)
            and (
                excluded_shop_id is None
                or product.shop_id != excluded_shop_id
            )
        ]

    @staticmethod
    def _rank_products(
        catalog: _CatalogIndex,
        profile: csr_matrix,
        candidate_positions: list[int] | range,
        limit: int,
        *,
        positive_scores_only: bool = False,
    ) -> list[ProductRecommendation]:
        if catalog.matrix is None:
            return []

        positions = list(candidate_positions)
        if not positions:
            return []
        similarities = cosine_similarity(
            profile, catalog.matrix[positions]
        ).ravel()
        scored_positions = [
            (positions[index], float(score))
            for index, score in enumerate(similarities)
            if not positive_scores_only or score > 0
        ]
        scored_positions.sort(
            key=lambda item: (-item[1], catalog.products[item[0]].product_id)
        )
        return [
            ProductRecommendation(
                product_id=catalog.products[position].product_id,
                product_name=catalog.products[position].name,
                score=min(1.0, max(0.0, score)),
            )
            for position, score in scored_positions[:limit]
        ]

    @staticmethod
    def _is_accessory(
        source_category_names: set[str], candidate_category_name: str
    ) -> bool:
        candidate = preprocess_text(candidate_category_name)
        if not candidate:
            return False

        is_phone_category = any(
            term in source_name
            for source_name in source_category_names
            for term in RecommendationService._PHONE_CATEGORY_TERMS
        )
        accessory_terms = (
            RecommendationService._PHONE_ACCESSORY_TERMS
            if is_phone_category
            else RecommendationService._GENERAL_ACCESSORY_TERMS
        )
        return any(term in candidate for term in accessory_terms)

    @staticmethod
    def _best_seller_recommendations(
        repository: RecommendationRepository,
        limit: int,
        excluded_product_ids: set[int],
    ) -> list[ProductRecommendation]:
        return [
            ProductRecommendation(
                product_id=product.id,
                product_name=product.name or "",
                score=0.0,
            )
            for product in repository.get_best_sellers(limit, excluded_product_ids)
        ]
