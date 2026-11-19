from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.api.router import api_router
from app.core.database import dispose_engine


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    dispose_engine()


app = FastAPI(
    title="Shopee Clone Recommendation Service",
    lifespan=lifespan,
)
app.include_router(api_router)
