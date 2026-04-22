## 1. Backend Fix

- [x] 1.1 Fix parameter passing in `server/src/api/ai.py`: change `diagnostic_service.analyze(req.code, stock, news)` to use keyword arguments `diagnostic_service.analyze(req.code, stock, indicators=indicators, fundamentals=fundamentals, news=news)`.
- [x] 1.2 Add database queries in `server/src/api/ai.py` to fetch latest indicators via `crud.get_latest_indicator(db, req.code)` and latest fundamentals via `crud.get_latest_fundamental(db, req.code)` before calling the diagnostic service.
- [x] 1.3 Convert `crud` ORM objects to plain dicts (or empty dict if None) so they can be passed to `diagnostic_service.analyze()`.
- [x] 1.4 Run backend unit tests to verify no regressions: `cd server && PYTHONPATH=. pytest tests/ -v --ignore=tests/e2e`.

## 2. Testing

- [x] 2.1 Add unit test in `server/tests/api/test_routes.py` (or appropriate file) for `POST /api/ai/analyze` that mocks `diagnostic_service.analyze` and asserts it receives `indicators` and `fundamentals` as dicts (not list).
- [x] 2.2 Add E2E test in `server/tests/e2e/` (e.g., `test_ai.py` or extend `test_quant.py`) that covers the full AI analyze flow with mocked external AI API.
- [x] 2.3 Run full backend test suite: `cd server && PYTHONPATH=. pytest -v`.

## 3. Verification

- [x] 3.1 Rebuild and run the full stack with Docker Compose: `docker-compose up -d --build`.
- [x] 3.2 Manually test the AI diagnosis endpoint via frontend or curl to confirm "分析失败: 'list' object has no attribute 'get'" no longer occurs.
