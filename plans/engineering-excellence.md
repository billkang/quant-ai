# Plan: 工程化最佳实践改造

> 基于 explore 模式下的讨论整理。目标：将当前快速原型升级为可维护的工程化项目，保持精简但规范。

## Architectural decisions

Durable decisions that apply across all phases:

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + Redis，保持现有技术栈
- **Frontend**: React 18 + Vite + Ant Design + TypeScript，保持现有技术栈
- **API Style**: REST JSON，统一响应格式 `{code, data, message}`
- **Database migrations**: Alembic（取代 `create_all()`）
- **Testing backend**: pytest + in-memory SQLite + monkeypatch
- **Testing frontend**: vitest + @testing-library/react + MSW
- **E2E**: Playwright + backend seed endpoints
- **Deploy**: Docker Compose（不上 K8s）
- **Package manager backend**: `uv` (keep current)
- **Package manager frontend**: `pnpm` (keep current)

---

## Phase 1: 代码质量门禁

**Scope**: 提交前自动运行 lint/format，不通过则阻止提交。只加工具不改逻辑。

### What to build

1. **Backend pre-commit**
   - Install `pre-commit` hook framework
   - Run `ruff check` and `ruff format --check` on staged Python files
   - Optionally run `pytest` quick smoke check

2. **Frontend husky + lint-staged**
   - Install `husky` + `lint-staged`
   - Run `eslint` + `prettier --check` on staged TS/TSX files

3. **One-time format**
   - Run `ruff format .` on `server/`
   - Run `prettier --write .` on `client/`
   - Commit the formatting changes separately

### Acceptance criteria

- [ ] `git commit` in `server/` fails if ruff finds issues
- [ ] `git commit` in `client/` fails if eslint/prettier finds issues
- [ ] All existing code formatted (one dedicated commit)
- [ ] Documented in AGENTS.md / README how to bypass if needed (`--no-verify`)

---

## Phase 2: 后端架构拆分 + Alembic

**Scope**: 拆分 `main.py`（361行），引入 Alembic，统一 API 响应格式。这是 ROI 最高的重构。

### What to build

1. **Router split**
   - Create `src/api/` with domain routers: `stocks.py`, `news.py`, `ai.py`, `portfolio.py`
   - Move endpoint logic from `main.py` to respective routers
   - `main.py`只剩 app 初始化、lifespan、middleware、路由挂载

2. **Unified response format**
   - Add `src/api/common.py` with `success_response(data)` and `error_response(message, code)`
   - All endpoints return `{code: int, data: any, message: str}`
   - Frontend interceptors can handle this consistently

3. **Alembic migrations**
   - `alembic init` in `server/`
   - Generate initial migration from existing models
   - Replace `Base.metadata.create_all()` with `alembic upgrade head` in lifespan
   - Document migration workflow in AGENTS.md

4. **Shared dependencies**
   - Create `src/api/deps.py` with `get_db()`, `get_redis()`

### Acceptance criteria

- [ ] `main.py` < 80 lines
- [ ] All API routes mounted via `app.include_router()`
- [ ] `GET /api/health` returns `{code: 0, data: {status: "ok"}, message: "ok"}`
- [ ] `alembic upgrade head` creates all tables correctly
- [ ] Docker build still works: `docker-compose up -d --build`

---

## Phase 3: 后端类型检查 + 核心测试

**Scope**: 加入 mypy，写核心业务测试。

### What to build

1. **mypy configuration**
   - Add `mypy` to dev dependencies
   - Configure `pyproject.toml` or `mypy.ini`
   - Run on `src/`, fix type errors (especially `import json` inside functions, missing returns)

2. **pytest infrastructure**
   - `tests/` directory structure
   - `conftest.py` with in-memory SQLite fixture, mock LLM fixture
   - `tests/services/test_news.py`: dedup logic, interval skip, empty data
   - `tests/services/test_scheduler.py`: DB connection leak fix + test
   - `tests/models/test_crud.py`: boundary conditions (remove nonexistent, etc.)

3. **Bug fix**
   - Fix `scheduler.py` DB connection leak (`db.close()` in `finally`)

### Acceptance criteria

- [ ] `mypy src/` passes with zero errors
- [ ] `pytest` runs all tests green (≥8 tests covering news, scheduler, crud)
- [ ] `scheduler.py` connection leak fixed and verified by test
- [ ] CI ready: `make test` command works

---

## Phase 4: 前端工程化 + 组件测试骨架

**Scope**: strict TS, prettier, vitest + MSW, extract API layer.

### What to build

1. **Strict TypeScript**
   - Update `tsconfig.json`: `strict: true`, `noUnusedLocals: true`
   - Fix all type errors (likely mostly implicit `any`)

2. **Prettier**
   - Install + configure `.prettierrc`
   - Run `prettier --write` on all source files
   - Add to husky lint-staged

3. **vitest + MSW setup**
   - Install `vitest`, `@testing-library/react`, `msw`
   - `vitest.config.ts` with jsdom environment
   - `src/mocks/handlers.ts` covering all API endpoints
   - Write first test: `Dashboard` loads and renders watchlist

4. **Extract API services layer**
   - Create `src/services/api.ts` with functions: `getWatchlist()`, `addStock()`, etc.
   - Refactor `Dashboard.tsx` to use `api.ts`
   - Keep changes minimal: only Dashboard in this phase, others later

### Acceptance criteria

- [ ] `tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` runs Dashboard test green
- [ ] Dashboard uses `services/api.ts` instead of inline `axios.get`

---

## Phase 5: E2E + Docker 优化

**Scope**: Playwright E2E, Docker production-ready, backup.

### What to build

1. **Backend seed endpoints**
   - `POST /__test__/reset-db`
   - `POST /__test__/seed/watchlist`
   - `POST /__test__/seed/portfolio`
   - `POST /__test__/seed/news-source`
   - Only available when `ENV=test`

2. **Playwright E2E**
   - Install + configure `playwright.config.ts`
   - `docker-compose.e2e.yml` with isolated test DB (port 5433) + server (port 8001) + client (port 4001)
   - POMs: `DashboardPage`, `AIAdvicePage`, `PortfolioPage`
   - Tests: smoke (navigate all pages), watchlist CRUD, AI diagnosis flow
   - `webServer` auto-start in playwright config

3. **Docker optimization**
   - Resource limits in `docker-compose.yml` (memory, cpus)
   - Log rotation (`json-file` driver with max-size)
   - Port binding `127.0.0.1:5432:5432` for DB security
   - Health check improvements (`start_period`)

4. **Backup script**
   - `scripts/backup-db.sh`: `pg_dump` + optional COS upload
   - `scripts/restore-db.sh`
   - Document in AGENTS.md

### Acceptance criteria

- [ ] `pnpm e2e` runs smoke + watchlist + AI tests green
- [ ] `docker-compose -f docker-compose.e2e.yml up` spins up isolated environment
- [ ] DB not exposed to external network
- [ ] Backup script works locally
- [ ] `make test` runs backend unit tests
- [ ] `make e2e` runs full E2E suite

---

## Phase 6: 安全加固

**Scope**: CORS, rate limit, input validation. 上云前的最后防线。

### What to build

1. **CORS tightening**
   - Replace `allow_origins=["*"]` with explicit origins
   - `allow_credentials=True` + `allow_origins=["*"]` is invalid combo, fix it

2. **Rate limiting**
   - `slowapi` or custom middleware
   - Limit `/api/ai/*` endpoints (expensive LLM calls)
   - Limit `/api/news/sources/*/fetch` (prevent abuse)

3. **Input validation**
   - Pydantic schemas for all POST/PUT bodies
   - Path param validation (e.g. `stock_code` format)

4. **Health check extension**
   - `/api/health/external` checks East Money + Yahoo availability
   - Returns 503 if data sources down

### Acceptance criteria

- [ ] CORS only allows `localhost:4000` and future production domain
- [ ] `/api/ai/analyze` rate limited to 10/min per IP
- [ ] All POST bodies validated by Pydantic
- [ ] External health endpoint returns data source status

---

## Appendix: Make commands (target state)

```makefile
dev:
	docker-compose up -d --build

check:
	cd server && ruff check . && ruff format --check . && mypy src/
	cd client && pnpm lint && tsc --noEmit

test:
	cd server && pytest -q
	cd client && pnpm test

e2e:
	cd e2e && pnpm exec playwright test

deploy:
	git pull
	docker-compose down
	docker-compose up -d --build

backup:
	./scripts/backup-db.sh

logs:
	docker-compose logs -f --tail=100 server
```

---

## Estimated timeline

| Phase | Estimated time | Key deliverable |
|-------|---------------|-----------------|
| 1 | 30 min | 代码提交前自动检查 |
| 2 | 4-6 hours | 后端架构清晰 + 数据库迁移 |
| 3 | 3-4 hours | 类型安全 + 核心测试覆盖 |
| 4 | 4-6 hours | 前端 strict + 测试骨架 |
| 5 | 6-8 hours | E2E + Docker 生产就绪 |
| 6 | 2-3 hours | 安全加固 |
| **Total** | **~3-4 days** | 完整工程化改造 |

---

> **Note**: Phases 1-3 are highest ROI and can be done independently. Phases 4-5 are frontend-heavy. Phase 6 is pre-deployment.
