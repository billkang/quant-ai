## 1. Database Migration

- [x] 1.1 Add `CollectionJob` model to `server/src/models/models.py`
- [x] 1.2 Generate Alembic migration for `collection_jobs` table
- [x] 1.3 Verify migration applies cleanly and rollback works

## 2. Backend — Collection Job APIs

- [x] 2.1 Implement `CollectionJob` CRUD operations in `server/src/models/crud.py`
- [x] 2.2 Create `server/src/api/collection.py` with `GET /api/collection/jobs` (list + filter)
- [x] 2.3 Add `GET /api/collection/jobs/{id}` (detail)
- [x] 2.4 Add `POST /api/collection/jobs/trigger` (manual trigger, BaseModel body)
- [x] 2.5 Add `POST /api/collection/jobs/{id}/cancel` (cancel running job)
- [x] 2.6 Register collection router in `server/src/main.py`

## 3. Backend — Scheduler & Progress Reporting

- [x] 3.1 Create `ProgressReporter` class in `server/src/services/progress_reporter.py`
- [x] 3.2 Implement `stock_collection_task` with watchlist quotes + market indices + sector data
- [x] 3.3 Implement `news_collection_task` with hourly source iteration and dedup
- [x] 3.4 Add Redis caching for intraday quotes (`stock:{code}:intraday`), indices (`market:indices`), sectors (`market:sectors`)
- [x] 3.5 Integrate new tasks into `SchedulerService` with 5-minute (trading hours) and hourly triggers
- [x] 3.6 Add job overlap prevention: skip trigger if same-type job is already running
- [x] 3.7 Update `interval_news_fetch` CronTrigger from `hour="*/6"` to `hour="*", minute=0`

## 4. Frontend — Collection Jobs Monitor Page

- [x] 4.1 Create `client/src/pages/CollectionJobs.tsx`
- [x] 4.2 Implement job list table with Ant Design `Table`, filters (`status`, `jobType`), and pagination
- [x] 4.3 Implement progress display using `Progress` component with auto-refresh (3s polling)
- [x] 4.4 Add manual trigger buttons for "采集行情" and "采集新闻"
- [x] 4.5 Add cancel action button for running jobs with confirmation modal
- [x] 4.6 Add job detail drawer showing `error_log`, `start_time`, `end_time`, `processed_items/total_items`
- [x] 4.7 Register route `/collection-jobs` in `client/src/App.tsx`
- [x] 4.8 Add "采集监控" navigation entry in `client/src/components/Layout.tsx`

## 5. Testing & Validation

- [x] 5.1 Write backend unit tests for `CollectionJob` CRUD (`tests/models/test_collection_jobs.py`)
- [x] 5.2 Write backend API tests for collection endpoints (`tests/api/test_collection.py`)
- [x] 5.3 Write backend tests for `ProgressReporter` cancel logic
- [x] 5.4 Write E2E tests for collection job trigger, progress polling, and cancel (`tests/e2e/test_collection.py`)
- [x] 5.5 Run `docker-compose up -d --build` and verify scheduler starts without errors
- [x] 5.6 Run `cd server && PYTHONPATH=. pytest -v` and fix failures
- [x] 5.7 Run `cd client && pnpm run test` and fix failures
