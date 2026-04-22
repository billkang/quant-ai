## 1. Add Missing Stub Package

- [x] 1.1 Add `types-requests` to `[project.optional-dependencies] dev` in `server/pyproject.toml`.

## 2. Fix Service Layer Type Errors

- [x] 2.1 Fix `src/services/fundamental_service.py` — add type ignore or cast for `requests` import.
- [x] 2.2 Fix `src/services/stock_data.py` — resolve `requests` import and `float` → `int` assignment.
- [x] 2.3 Fix `src/services/backtest_service.py` — resolve `float` → `int` assignment.
- [x] 2.4 Fix `src/services/portfolio_analysis_service.py` — cast `Column[str]` to `str` before passing to `get_a_stock_kline`.
- [x] 2.5 Fix `src/services/news.py` — cast `Column[int]` to `int` for `fetch_and_save_news`, `timedelta(minutes=...)`, and handle `datetime | None` for `save_news_article`.

## 3. Fix API Layer Type Errors

- [x] 3.1 Fix `src/api/deps.py` — cast redis get result to `str` before `json.loads`.
- [x] 3.2 Fix `src/api/auth.py` — cast `Column[str]` to `str` for `_verify_password` arguments and add `# type: ignore` for ORM assignment.
- [x] 3.3 Fix `src/api/stocks.py` — cast `Column[int]` to `int` for `user_id` and `Column[str]` to `str` for stock code.
- [x] 3.4 Fix `src/api/quant.py` — cast `Column[int]` to `int` for all `user_id` arguments.
- [x] 3.5 Fix `src/api/portfolio.py` — cast `Column[int]` to `int` for `user_id`, cast `Column[str]` to `str` for stock quotes, and fix `int` assignments.
- [x] 3.6 Fix `src/api/ai.py` — cast `Column[int]` to `int` for all `user_id` arguments.

## 4. Fix Remaining Type Errors

- [x] 4.1 Fix `src/main.py` — `types-requests` stub package resolves `requests` import-untyped errors.
- [x] 4.2 Fix `src/services/scheduler.py` — `annotation-unchecked` is a note (not an error); `check_untyped_defs=false` is already configured.

## 5. Validate

- [x] 5.1 Run `mypy src` in the `server` directory and confirm zero errors.
