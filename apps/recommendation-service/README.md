# Recommendation Service

FastAPI microservice for content-based product recommendations. SQLAlchemy maps
the confirmed one-to-many `products.category_id` relationship and reads user
signals from `orders`, `order_items`, `product_variants`, and `search_logs`.

## Layout

```text
app/
  api/          HTTP routes and FastAPI dependencies
  core/         Settings, SQLAlchemy engine, and request-scoped sessions
  models/       SQLAlchemy mappings for products, categories, orders, and logs
  repositories/ ORM data access and user-signal queries
  schemas/      Pydantic request/response schemas
  services/     TF-IDF, cosine similarity, and in-memory catalog cache
tests/
main.py         Compatibility entrypoint for `uvicorn main:app`
```

## Run

Set `DATABASE_URL` in the environment or in this service's `.env`, then run
from `apps/recommendation-service`:

```powershell
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

`uvicorn main:app --host 0.0.0.0 --port 8000` remains supported. The database
URL must use an installed PostgreSQL driver, for example
`postgresql+psycopg2://...`.

The ORM mapping follows the existing TypeORM schema: products have a nullable
`category_id`, orders link to users, and order items link to product variants
whose `product_id` identifies the purchased product. Search logs require a
nullable `user_id`. The recommendation code counts only `delivered` and
`completed` orders as purchases. It maps only columns needed by this service
and does not create or migrate database tables.

## API

- `GET /health` is a liveness endpoint and does not query the database.
- `GET /recommend/{product_id}?min_price=100&max_price=500&exclude_same_shop=true`
  returns similar products; `limit` defaults to 10 and is constrained to 1-100.
- `POST /recommend/cart` accepts `{"product_ids":[1,2]}` and returns up to 10
  complementary or same-category suggestions.
- `GET /recommend/user/{user_id}?limit=10` builds a profile from completed
  purchases and that user's search log; users without usable history get active
  best sellers.
- `GET /recommend/keyword?q=điện%20thoại&limit=10` matches a keyword against
  the catalog TF-IDF vocabulary.

The catalog and TF-IDF matrix are cached per process for
`RECOMMENDATION_CACHE_TTL_SECONDS` seconds (default: 300). Product names are
weighted three times and category names twice; text normalization preserves
Vietnamese letters and diacritics. Each worker process has its own cache.

Run the unit tests from this directory with:

```powershell
python -m unittest discover -s tests
```
