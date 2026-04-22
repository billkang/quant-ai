from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config as AlembicConfig
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import ai, news, portfolio, quant, stocks
from src.core.config import settings
from src.core.docs_auth import DocsAuthMiddleware
from src.core.exceptions import register_exception_handlers
from src.core.middleware import RateLimitMiddleware
from src.services.scheduler import scheduler_service


def _run_migrations():
    alembic_cfg = AlembicConfig("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations()
    await scheduler_service.start()
    yield
    await scheduler_service.stop()


app = FastAPI(title="Quant AI API", version="0.1.0", lifespan=lifespan)
register_exception_handlers(app)

# CORS: allow local dev and production domain
# allow_credentials=True + allow_origins=["*"] is invalid in browsers
# Use explicit origins or omit credentials for wildcard
_cors_origins = ["http://localhost:4000", "http://localhost:5173"]
if settings.ENV == "production" and settings.FRONTEND_URL:
    _cors_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)
app.add_middleware(DocsAuthMiddleware)

app.include_router(stocks.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(quant.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"code": 0, "data": {"status": "ok"}, "message": "ok"}


@app.get("/api/health/external")
async def external_health_check():
    import requests

    errors = []
    try:
        resp = requests.get(
            "https://push2.eastmoney.com/api/qt/clist/get",
            params={
                "pn": 1,
                "pz": 1,
                "po": 1,
                "np": 1,
                "ut": "bd1d9ddb04089700cf9c27f6f7426281",
                "fltt": 2,
                "invt": 2,
                "fid": "f3",
                "fs": "m:0+t:6,m:0+t:80",
                "fields": "f1,f2,f3,f4,f5,f6,f7,f12,f13,f14",
            },
            timeout=5,
        )
        if resp.status_code != 200:
            errors.append("eastmoney")
    except Exception:
        errors.append("eastmoney")

    try:
        resp = requests.get(
            "https://query1.finance.yahoo.com/v8/finance/chart/000001.SS", timeout=5
        )
        if resp.status_code != 200:
            errors.append("yahoo")
    except Exception:
        errors.append("yahoo")

    if errors:
        from fastapi import HTTPException

        raise HTTPException(status_code=503, detail=f"数据源异常: {', '.join(errors)}")

    return {"code": 0, "data": {"status": "ok"}, "message": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
