# Quant AI - Agent Instructions

## Quick Start

```bash
# Build and run
docker-compose up -d --build

# View logs
docker-compose logs -f server
docker-compose logs -f client
```

## Developer Commands

```bash
# Frontend
cd client && pnpm run dev    # Dev server at localhost:5173
cd client && pnpm run lint   # Lint check
cd client && pnpm run test   # Run vitest

# Backend (requires PostgreSQL + Redis)
cd server && PYTHONPATH=. uvicorn src.main:app --reload

# Database migrations
docker-compose exec server alembic upgrade head

# E2E tests
cd server && PYTHONPATH=. pytest tests/e2e/ -v

# Data Pipeline (Scheduler jobs run automatically in Docker)
# Manual trigger via API:
curl http://localhost:8000/api/quant/portfolio/analysis
curl http://localhost:8000/api/quant/alerts
```

## Architecture

- **Frontend**: React + Vite + Ant Design (use AntD components, not raw HTML elements for UI)
- **Backend**: FastAPI with Pydantic BaseModel for request bodies
- **API Pattern**: FastAPI endpoints use `BaseModel` classes for POST bodies. Query params for simple GETs.

## Key Conventions

1. **Docker-first**: All changes should work in Docker. Test locally with `docker-compose up -d --build`
2. **API params**: FastAPI endpoints use `BaseModel` classes for POST bodies. Query params for simple GETs.
3. **Frontend components**: Use existing pages under `client/src/pages/` as reference
4. **No separate watchlist page**: Functionality merged into Dashboard
5. **Backend config**: All tool configs live in `server/pyproject.toml` (ruff, mypy, pytest)
6. **Tests are mandatory**: Every feature or bug-fix PR must include both unit tests and E2E tests. Do not treat tests as an afterthought.

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4000 | http://localhost:4000 |
| Backend | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

## Testing Requirements

**Every feature or bug-fix must include both unit tests and E2E tests.**

### When adding a new feature

1. **Unit tests** — cover individual functions/services/models:
   - API route tests in `tests/api/`
   - Service logic tests in `tests/services/`
   - CRUD / model tests in `tests/models/`
2. **E2E tests** — cover complete user flows in `tests/e2e/`:
   - Use the `e2e_client` fixture from `tests/e2e/conftest.py`
   - Mock external APIs (stock data, news, AI) to avoid rate limits
   - Each test runs against a real PostgreSQL container (auto-started / destroyed)
   - Reference existing test files: `test_watchlist.py`, `test_quant.py`, `test_pipeline.py`, `test_portfolio.py`

### When modifying existing code

- If your change breaks existing tests, update the tests in the same PR.
- If your change adds new code paths (new API endpoint, new scheduler job, new CRUD operation), add corresponding E2E coverage.

### Running tests

```bash
# E2E tests (Docker PostgreSQL container, auto-managed)
cd server && PYTHONPATH=. pytest tests/e2e/ -v

# Unit tests only (no Docker required)
cd server && PYTHONPATH=. pytest tests/ -v --ignore=tests/e2e

# All backend tests
cd server && PYTHONPATH=. pytest -v

# Frontend tests
cd client && pnpm run test
```

> **Note**: E2E tests require a local Docker daemon. They start a temporary `postgres:16-alpine` container, run alembic migrations, execute tests with transaction isolation, and destroy the container on teardown.

## Testing Changes

```bash
# Rebuild after code changes
docker-compose up -d --build

# Run backend tests
cd server && PYTHONPATH=. pytest -v

# Run frontend tests
cd client && pnpm run test
```

## Important Files

- `docker-compose.yml` - Orchestration
- `server/src/main.py` - API routes
- `server/src/api/quant.py` - Quantitative analysis APIs (indicators, backtest, portfolio analysis, alerts)
- `server/src/models/` - Database models
- `server/src/services/indicator.py` - Technical indicator calculations
- `server/src/services/backtest_service.py` - Strategy backtest engine
- `server/src/services/scheduler.py` - Data pipeline scheduler
- `server/pyproject.toml` - Python dependencies and tool configs
- `client/src/pages/` - Page components
- `client/src/components/Layout.tsx` - Main layout
