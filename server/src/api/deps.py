import json

import redis

from src.core.config import settings
from src.models.database import get_db
from src.services.stock_data import stock_service

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def get_redis():
    return redis_client


def _get_stock_by_code(code: str) -> dict | None:
    code_upper = code.upper()
    if ".HK" in code_upper:
        return stock_service.get_hk_stock_quote(code)
    elif ".US" in code_upper:
        return stock_service.get_hk_stock_quote(code)
    else:
        return stock_service.get_a_stock_quote(code)


async def get_stock(code: str) -> dict | None:
    cache_key = f"stock:{code}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    stock = _get_stock_by_code(code)

    if stock:
        redis_client.setex(cache_key, 60, json.dumps(stock))
    return stock or {}


__all__ = ["get_db", "get_redis", "_get_stock_by_code", "get_stock", "redis_client"]
