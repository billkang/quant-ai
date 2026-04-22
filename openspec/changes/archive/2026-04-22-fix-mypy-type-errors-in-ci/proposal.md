## Why

The GitHub Actions CI backend job now fails at the `mypy` step with 33 type errors across 12 files. The errors fall into three categories: (1) missing stub packages (`types-requests`), (2) SQLAlchemy `Column[T]` types being passed where plain `T` is expected, and (3) incompatible assignments and argument types. This blocks all PRs from passing CI.

## What Changes

- Add `types-requests` to the `[project.optional-dependencies] dev` list in `server/pyproject.toml` so CI can install it.
- Fix SQLAlchemy `Column[T]` type mismatches by casting/extracting scalar values before passing them to typed functions.
- Fix `float` → `int` assignment mismatches by using correct types or explicit casts.
- Fix `Awaitable[Any] | Any` passed to `json.loads` by awaiting the coroutine first.
- Fix `datetime | None` passed to non-nullable parameters by adding null checks or adjusting types.
- Update `tool.mypy` config to suppress untyped function bodies warning (`check_untyped_defs = false` is already set).

## Capabilities

### New Capabilities

None. This is a code-quality / CI infrastructure fix.

### Modified Capabilities

None. No product-level requirements or API behaviors are changing.

## Impact

- `server/pyproject.toml` — add `types-requests` to dev dependencies.
- `server/src/services/fundamental_service.py`
- `server/src/services/stock_data.py`
- `server/src/services/backtest_service.py`
- `server/src/services/portfolio_analysis_service.py`
- `server/src/services/news.py`
- `server/src/services/scheduler.py`
- `server/src/api/deps.py`
- `server/src/api/auth.py`
- `server/src/api/stocks.py`
- `server/src/api/quant.py`
- `server/src/api/portfolio.py`
- `server/src/api/ai.py`
- `server/src/main.py`

No breaking changes to APIs or database schema.
