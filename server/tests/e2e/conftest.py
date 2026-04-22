"""E2E test fixtures using Docker PostgreSQL (testcontainers-style).

A fresh PostgreSQL container is started once per test session,
alembic migrations are applied, and the container is destroyed
after the session ends—even if tests fail.
"""

import os
import socket
import subprocess
import time

# Ensure Settings() does not blow up when this conftest is first imported.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _find_free_port() -> int:
    """Return an available TCP port on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _pg_is_ready(db_url: str, timeout: float = 30.0) -> bool:
    """Poll PostgreSQL until it accepts connections or *timeout* expires."""
    import psycopg2

    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            conn = psycopg2.connect(db_url)
            conn.close()
            return True
        except psycopg2.OperationalError:
            time.sleep(0.5)
    return False


# ---------------------------------------------------------------------------
# Session-scoped fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def _pg_container():
    """
    Start a throw-away PostgreSQL container, run alembic migrations,
    and yield the database URL.  The container is stopped & removed
    during teardown regardless of test outcome.
    """
    port = _find_free_port()
    container_name = f"quant-ai-test-db-{os.getpid()}"
    db_url = f"postgresql://test:test@127.0.0.1:{port}/quant_ai_test"

    subprocess.run(
        [
            "docker",
            "run",
            "-d",
            "--rm",
            "--name",
            container_name,
            "-e",
            "POSTGRES_USER=test",
            "-e",
            "POSTGRES_PASSWORD=test",
            "-e",
            "POSTGRES_DB=quant_ai_test",
            "-p",
            f"{port}:5432",
            "postgres:16-alpine",
        ],
        check=True,
    )

    if not _pg_is_ready(db_url):
        subprocess.run(["docker", "stop", container_name], check=False)
        raise RuntimeError(
            f"PostgreSQL test container '{container_name}' failed to start within 30s"
        )

    # Apply migrations manually so the DB schema is ready before any test runs.
    from alembic import command as alembic_cmd
    from alembic.config import Config as AlembicConfig

    # env.py overrides sqlalchemy.url from os.environ["DATABASE_URL"], so we
    # must temporarily point it at the test container before running alembic.
    old_db_url = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = db_url

    cfg = AlembicConfig("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", db_url)
    try:
        alembic_cmd.upgrade(cfg, "head")
    finally:
        if old_db_url is None:
            os.environ.pop("DATABASE_URL", None)
        else:
            os.environ["DATABASE_URL"] = old_db_url

    yield db_url

    # Always clean up, even on fixture failure.
    subprocess.run(["docker", "stop", container_name], check=False)


@pytest.fixture(scope="session")
def _pg_engine(_pg_container):
    """
    Create a SQLAlchemy engine pointing at the test container,
    monkey-patch ``src.models.database`` so all downstream modules
    (including those already imported) use the PG engine.
    """
    engine = create_engine(_pg_container)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    import src.models.database as db_module

    db_module.engine = engine
    db_module.SessionLocal = Session

    yield engine

    engine.dispose()


# ---------------------------------------------------------------------------
# Function-scoped fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def db_session(_pg_engine):
    """
    Yield a DB session bound to a nested transaction.
    The transaction is rolled back after each test so tests remain
    isolated from one another.
    """
    connection = _pg_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def e2e_client(monkeypatch, db_session):
    """
    Return a ``TestClient`` with:
    * PostgreSQL test DB (via dependency override + module monkey-patch)
    * Fake Redis
    * Mocked stock data, fundamentals, news, and AI services
    * Migrations and scheduler lifecycle disabled for speed
    """
    # Import app lazily so the database module has already been patched.
    import src.api.deps as deps
    from src.main import app

    # --- FastAPI dependency override for get_db ---
    def _mock_get_db():
        try:
            yield db_session
        finally:
            pass  # lifecycle handled by the db_session fixture

    app.dependency_overrides[deps.get_db] = _mock_get_db

    # --- Patch Redis ---
    class _FakeRedis:
        _store = {}

        def get(self, key):
            return self._store.get(key)

        def setex(self, key, ttl, value):
            self._store[key] = value

        def delete(self, *keys):
            for k in keys:
                self._store.pop(k, None)

    monkeypatch.setattr(deps, "redis_client", _FakeRedis())

    # --- Patch stock data service ---
    from datetime import date, timedelta

    import src.services.stock_data as stock_data_module

    def _mock_a_quote(symbol):
        return {
            "code": symbol,
            "name": f"股票{symbol}",
            "price": 10.5,
            "open": 10.0,
            "high": 11.0,
            "low": 9.5,
            "volume": 100000,
            "amount": 1050000,
            "change": 0.5,
            "changePercent": 5.0,
        }

    def _mock_hk_quote(symbol):
        return {
            "code": symbol,
            "name": f"港股{symbol}",
            "price": 85.15,
            "open": 84.0,
            "high": 86.0,
            "low": 83.5,
            "volume": 500000,
            "amount": 42575000,
            "change": 1.15,
            "changePercent": 1.37,
        }

    def _generate_kline(start_date, days=100):
        data = []
        base_price = 10.0
        for i in range(days):
            d = start_date - timedelta(days=days - 1 - i)
            price = base_price + (i % 20 - 10) * 0.1
            data.append(
                {
                    "date": d.strftime("%Y-%m-%d"),
                    "open": round(price - 0.1, 2),
                    "close": round(price, 2),
                    "high": round(price + 0.2, 2),
                    "low": round(price - 0.2, 2),
                    "volume": 100000 + i * 100,
                    "amount": 1000000 + i * 1000,
                }
            )
        return data

    def _mock_a_kline(symbol, period):
        return _generate_kline(date(2024, 12, 31), 100)

    def _mock_hk_kline(symbol, period):
        return _generate_kline(date(2024, 12, 31), 100)

    monkeypatch.setattr(stock_data_module.stock_service, "get_a_stock_quote", _mock_a_quote)
    monkeypatch.setattr(stock_data_module.stock_service, "get_hk_stock_quote", _mock_hk_quote)
    monkeypatch.setattr(stock_data_module.stock_service, "get_a_stock_kline", _mock_a_kline)
    monkeypatch.setattr(stock_data_module.stock_service, "get_hk_stock_kline", _mock_hk_kline)

    # --- Patch fundamental service ---
    import src.services.fundamental_service as fs_module

    def _mock_fundamental(code):
        return {
            "pe_ttm": 15.5,
            "pb": 2.1,
            "ps": 1.8,
            "roe": 12.5,
            "roa": 8.3,
            "gross_margin": 35.0,
            "net_margin": 18.0,
            "revenue_growth": 10.2,
            "profit_growth": 8.5,
            "debt_ratio": 45.0,
            "free_cash_flow": 1000000.0,
        }

    monkeypatch.setattr(fs_module.fundamental_service, "fetch_fundamental", _mock_fundamental)

    # --- Patch news service internal SessionLocal ---
    import src.models.database as db_module
    import src.services.news as news_module

    monkeypatch.setattr(news_module, "SessionLocal", db_module.SessionLocal)

    def _mock_fetch_stock_news(symbol):
        return [
            {
                "新闻标题": f"{symbol} 测试新闻",
                "新闻内容": "这是一条测试新闻内容",
                "新闻链接": f"http://test.com/news/{symbol}",
                "发布时间": "2025-01-01 10:00:00",
                "文章来源": "测试源",
            }
        ]

    monkeypatch.setattr(news_module.news_service, "_fetch_stock_news", _mock_fetch_stock_news)
    monkeypatch.setattr(news_module.news_service, "_fetch_stock_notices", lambda s: [])
    monkeypatch.setattr(news_module.news_service, "_fetch_macro_news", lambda: [])

    # --- Patch scheduler internal SessionLocal ---
    import src.services.scheduler as sched_module

    monkeypatch.setattr(sched_module, "SessionLocal", db_module.SessionLocal)

    # --- Patch AI services ---
    import src.services.ai_analysis as ai_module

    monkeypatch.setattr(ai_module.ai_service, "analyze_stock", lambda s, n: "AI分析结果（测试）")
    monkeypatch.setattr(
        ai_module.ai_service,
        "answer_question",
        lambda q, ctx: f"这是一个测试回答：{q}",
    )

    import src.services.ai_diagnostic as diag_module

    monkeypatch.setattr(
        diag_module.diagnostic_service,
        "analyze",
        lambda code, stock, news: {
            "fundamental_analysis": "基本面良好（测试）",
            "technical_analysis": "技术面中性（测试）",
            "risk_analysis": "风险可控（测试）",
            "final_report": "综合诊断报告（测试）",
            "score": "80",
        },
    )

    # --- Remove rate-limit and docs-auth middleware so tests run unrestricted ---

    app.user_middleware = [
        m
        for m in app.user_middleware
        if m.cls.__name__ not in ("RateLimitMiddleware", "DocsAuthMiddleware")
    ]
    # Force rebuild of the middleware stack on next request
    app.middleware_stack = None

    # --- Disable lifespan tasks (migrations already ran, scheduler not needed) ---
    import src.main as main_module

    monkeypatch.setattr(main_module, "_run_migrations", lambda: None)

    async def _noop():
        pass

    monkeypatch.setattr(sched_module.scheduler_service, "start", _noop)
    monkeypatch.setattr(sched_module.scheduler_service, "stop", _noop)

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()
