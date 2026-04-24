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

# Backend E2E tests (API integration tests)
cd server && PYTHONPATH=. pytest tests/e2e/ -v

# Playwright E2E tests (browser E2E tests)
cd client && pnpm exec playwright install chromium   # One-time browser install
cd client && pnpm run test:e2e                       # Headless run
cd client && pnpm run test:e2e:ui                    # Interactive UI mode

# Docker E2E (full stack)
E2E_SEED_ENABLED=true docker compose --profile e2e up --build --exit-code-from playwright

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
7. **Documentation is mandatory**: Every feature or bug-fix PR must update the user documentation site (`client/src/docs/content/`) and the relevant developer docs.

## Code Style Guide

> **Pre-commit hooks are configured** to auto-fix most style issues. Run `pre-commit install` if you haven't already. Hooks auto-run on `git commit` (auto-fix) and `git push` (type-check).

### Pre-commit / Pre-push Hooks

```bash
# Install hooks (one-time)
pre-commit install

# What runs automatically:
# - git commit  → ruff --fix, ruff-format, eslint --fix, prettier --write
# - git push    → mypy (server)
```

**Do not manually fix formatting or unused imports.** The hooks auto-fix them on commit. If a hook fails and modifies files, `git add` the changes and commit again.

### Python (Backend)

- **Formatter**: `ruff format` (configured in `server/pyproject.toml`)
  - Line length: 100
  - Double quotes, 4-space indentation
- **Linter**: `ruff check --fix`
  - Enabled rules: E, W, F, I (isort), B (bugbear), C4, UP (pyupgrade)
  - Ignored: E501 (line too long), B008
  - **Do NOT run manually — hooks handle it.**
- **Type hints**: Use `from typing import Any` for dynamic dicts/lists. Use `cast()` for SQLAlchemy Column assignments.
- **Imports**: Sort with `ruff check --fix` (isort rule). Group: stdlib → third-party → local (`src.*`).
- **Naming**: Use `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_CASE` for constants.
- **SQLAlchemy**: Use `Column(..., nullable=True)` for optional fields. Use `default=dict` for JSON columns.

### TypeScript / React (Frontend)

- **Formatter**: `prettier` (config in `client/.prettierrc`)
  - No semicolons, single quotes, 2-space indent, trailing commas (es5), printWidth 100
- **Linter**: `eslint` (config in `client/eslint.config.js`)
  - **Do NOT run manually — hooks handle it.**
- **Key rules**:
  - `@typescript-eslint/no-unused-vars` — prefix unused args with `_` to suppress
  - `react-refresh/only-export-components` — page components should be default exports in separate files
  - `react-hooks/exhaustive-deps` — ensure dependency arrays are correct
- **Ant Design**: Use AntD components (`Button`, `Input`, `Table`, etc.) instead of raw HTML elements. Style with CSS variables (`var(--bg-surface)`, `var(--accent)`).
- **Types**: Prefer explicit interfaces over `any`. When using `axios` responses, type them with `ApiResponse<T>`.
- **Naming**: Use `PascalCase` for components/interfaces, `camelCase` for functions/variables, `UPPER_CASE` for constants.

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
# Backend E2E tests (Docker PostgreSQL container, auto-managed)
cd server && PYTHONPATH=. pytest tests/e2e/ -v

# Playwright browser E2E tests
cd client && pnpm run test:e2e
cd client && pnpm run test:e2e:ui

# Unit tests only (no Docker required)
cd server && PYTHONPATH=. pytest tests/ -v --ignore=tests/e2e

# All backend tests
cd server && PYTHONPATH=. pytest -v

# Frontend unit tests
cd client && pnpm run test
```

> **Note**: Backend E2E tests require a local Docker daemon. They start a temporary `postgres:16-alpine` container, run alembic migrations, execute tests with transaction isolation, and destroy the container on teardown.
>
> Playwright E2E tests require the full application stack running (PostgreSQL, Redis, server, client). Use `docker compose --profile e2e up --build` to run them in a containerized environment, or start the services manually and run `pnpm run test:e2e` locally.

## Testing Changes

```bash
# Rebuild after code changes
docker-compose up -d --build

# Run backend tests
cd server && PYTHONPATH=. pytest -v

# Run frontend tests
cd client && pnpm run test
```

## User Documentation Site

QuantMaster 内置在线文档站（使用手册），路径为 `/docs`。

### 文档站架构

- **入口页面**: `client/src/pages/Docs.tsx`
- **Markdown 内容**: `client/public/docs/*.md`
- **配置文件**: `client/src/docs/config.ts`
- **路由**: `App.tsx` 中 `/docs` 路由
- **导航入口**: `Layout.tsx` 侧边栏 "使用手册"

### 内容组织

文档按分类组织，Markdown 文件放在 `client/public/docs/`，结构在 `config.ts` 中注册：

```
client/public/docs/
├── overview.md           # 产品概览
├── dashboard.md          # 仪表盘
├── market-analysis.md    # 行情分析
├── strategy-management.md# 策略管理
├── backtest.md           # 回测报告
├── portfolio.md          # 资产组合
├── paper-trading.md      # 虚拟盘
├── events.md             # 事件查询
├── screener.md           # 股票筛选器
├── alerts.md             # 告警与规则
├── data-management.md    # 数据管理
└── settings.md           # 系统设置
```

### 何时更新文档

**任何新增或修改用户可见功能的 PR，必须同步更新对应文档章节。** 包括但不限于：
- 新增页面或功能模块
- 修改现有功能的交互流程
- 新增配置项、筛选条件、指标字段
- 调整 UI 布局或操作路径

### 如何更新文档

1. 找到对应的功能模块 `.md` 文件（如修改了回测功能，编辑 `backtest.md`）
2. 使用 Markdown 格式更新内容，支持以下语法：
   - `#` / `##` / `###` 标题
   - `-` 无序列表
   - `**bold**` 加粗
   - `` `code` `` 行内代码
   - ` ``` ` 代码块
   - `| table |` 表格
3. 如需新增章节，在 `client/src/docs/config.ts` 的 `docCategories` 中注册
4. 如需新增分类，新建 `.md` 文件放入 `client/public/docs/`，并在 `config.ts` 中引入

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
- `client/public/docs/` - User documentation Markdown files
- `client/src/docs/config.ts` - Documentation site navigation config
