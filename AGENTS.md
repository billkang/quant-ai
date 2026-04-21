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

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4000 | http://localhost:4000 |
| Backend | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

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
