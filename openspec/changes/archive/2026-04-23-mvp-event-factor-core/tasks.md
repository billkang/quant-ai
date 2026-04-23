## 1. Database Migration

- [x] 1.1 Create Alembic migration for new tables: `events`, `event_sources`, `event_jobs`, `event_rules`, `event_factors`, `factor_snapshots`, `strategies`, `strategy_versions`
- [x] 1.2 Migrate `strategy_backtests` to `backtest_tasks` with new columns (`strategy_id`, `strategy_version_id`, `progress`, `params`, `factor_snapshot_ids`, `status`, `completed_at`)
- [x] 1.3 Add `backtest_task_id`, `strategy_id`, `user_id`, `is_active`, `unrealized_pnl` to `positions` table (or create `strategy_positions`)
- [x] 1.4 Create `stock_sector_mappings` table with CSRC industry classification
- [x] 1.5 Seed builtin strategies (ma_cross, rsi_oversold, macd_signal) into `strategies` table with `is_builtin: true`
- [x] 1.6 Seed default `event_sources` configurations and `event_rules` (sentiment v1, classifier v1, sector mapper v1)

## 2. Event Pipeline Core

- [x] 2.1 Implement `EventSource` model and CRUD operations
- [x] 2.2 Implement `EventJob` model and logging
- [x] 2.3 Implement `EventRule` model with version management
- [x] 2.4 Create `EventPipelineService` with fetcher registry and job execution
- [x] 2.5 Implement `StockNewsFetcher` (akshare `stock_news_em`)
- [x] 2.6 Implement `StockNoticeFetcher` (akshare `stock_zh_a_alerts`)
- [x] 2.7 Implement `MacroDataFetcher` (akshare macro indicators)
- [x] 2.8 Implement title similarity deduplication engine (SequenceMatcher or rapidfuzz)
- [x] 2.9 Implement keyword-based sentiment extractor
- [x] 2.10 Implement rule-based event classifier
- [x] 2.11 Implement CSRC sector mapper with akshare sync
- [x] 2.12 Implement daily `event_factors` aggregator
- [x] 2.13 Integrate event pipeline into APScheduler (`daily_event_update`, `interval_news_fetch`)

## 3. Factor Snapshot System

- [x] 3.1 Implement `FactorSnapshot` model
- [x] 3.2 Create `FactorSnapshotBuilder` service (align technical + events by trade_date)
- [x] 3.3 Implement snapshot generation API (`POST /api/factors/snapshots/generate`)
- [x] 3.4 Implement snapshot query APIs (`GET /api/factors/snapshots/{symbol}`, `GET /api/factors/snapshot/latest`)
- [x] 3.5 Add snapshot generation to scheduler (after daily data update)

## 4. Strategy Management

- [x] 4.1 Implement `Strategy` and `StrategyVersion` models
- [x] 4.2 Implement strategy CRUD APIs (`/api/strategies`)
- [x] 4.3 Implement strategy version APIs (`/api/strategies/{id}/versions`)
- [x] 4.4 Implement builtin strategy listing (`/api/strategies/builtin`)
- [x] 4.5 Implement parameter validation against `params_schema` (JSON Schema)
- [x] 4.6 Refactor `BacktestService` to load strategies dynamically from `strategies` table
- [x] 4.7 Update backtest engine to pass `factor_snapshots` DataFrame (with event columns) to strategies

## 5. Backtest Engine Refactoring

- [x] 5.1 Update `BacktestRequest` BaseModel to include `strategyId`, `strategyVersionId`
- [x] 5.2 Update `POST /api/quant/backtest` to validate strategy params, load snapshots, and run
- [x] 5.3 Update `BacktestTask` model to store `factor_snapshot_ids`
- [x] 5.4 Update `GET /api/quant/backtests` and `GET /api/quant/backtests/{id}` to include strategy references
- [x] 5.5 Ensure backward compatibility for existing backtest records (strategy_name fallback)

## 6. Virtual Portfolio

- [x] 6.1 Refactor `positions` model to support virtual holdings (add `backtest_task_id`, `strategy_id`, `is_active`)
- [x] 6.2 Update portfolio API to query virtual positions by backtest task
- [x] 6.3 Auto-generate positions from backtest `trades` JSON on backtest completion
- [x] 6.4 Update portfolio PnL calculation to use closing price (not real-time quote)

## 7. Event Management APIs

- [x] 7.1 Implement `GET /api/events` with filtering (symbol, sector, scope, date_range, source_type)
- [x] 7.2 Implement `PUT /api/events/{id}` for editing event signals/title/summary
- [x] 7.3 Implement `DELETE /api/events/{id}` with cascade regeneration of affected `event_factors`
- [x] 7.4 Implement `GET/POST/PUT/DELETE /api/event-sources`
- [x] 7.5 Implement `POST /api/event-sources/{id}/trigger` for manual fetch
- [x] 7.6 Implement `GET /api/event-jobs` and `GET /api/event-jobs/{id}`
- [x] 7.7 Implement `GET/POST/PUT /api/event-rules` and `POST /api/event-rules/{id}/activate`
- [x] 7.8 Add `GET /api/stocks/{code}/event-factors` and `GET /api/stocks/{code}/sector`

## 8. Dashboard Redesign

- [x] 8.1 Implement `GET /api/dashboard` with research overview, recent tasks, top strategies, data coverage
- [x] 8.2 Redesign Dashboard frontend: stats cards (strategies count, backtests count), recent backtests list, top strategies table, data coverage indicators
- [x] 8.3 Remove simulated portfolio data from Dashboard (move to real data)

## 9. Frontend Pages

- [x] 9.1 Create `/events` page: event list with filters (read-only view with edit/delete for admins)
- [x] 9.2 Create `/event-sources` page: data source configuration (CRUD, enable/disable, schedule settings)
- [x] 9.3 Create `/event-jobs` page: fetch job history with logs and status
- [x] 9.4 Create `/event-rules` page: rule version management (sentiment keywords editor, classifier rules, sector mapping)
- [x] 9.5 Redesign `/strategy-management` page: strategy CRUD, parameter schema editor, version history
- [x] 9.6 Update `/backtest` page: strategy selector from strategies table, param inputs from schema
- [x] 9.7 Update `/portfolio` page: show virtual positions grouped by backtest task

## 10. Testing & Validation

- [x] 10.1 Write unit tests for `EventPipelineService` (fetch, dedup, extract, aggregate)
- [x] 10.2 Write unit tests for `FactorSnapshotBuilder`
- [x] 10.3 Write unit tests for strategy parameter validation
- [x] 10.4 Write E2E tests for event source CRUD and manual trigger
- [x] 10.5 Write E2E tests for backtest with parameterized strategy
- [x] 10.6 Write E2E tests for dashboard research overview
- [x] 10.7 Run `docker-compose up -d --build` and verify full stack
- [x] 10.8 Run `cd server && PYTHONPATH=. pytest -v` and fix failures
- [x] 10.9 Run `cd client && pnpm run test` and fix failures

## 11. Data Seeding & Initialization

- [x] 11.1 Create seed script for builtin strategies with params_schema
- [x] 11.2 Create seed script for default event_sources and event_rules
- [x] 11.3 Create seed script for CSRC sector mappings (top 300 stocks)
- [x] 11.4 Create migration script to convert existing `strategy_backtests` to `backtest_tasks`
- [x] 11.5 Generate initial `factor_snapshots` for watchlist stocks (last 60 days)
