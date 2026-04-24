## 1. Database Migration

- [x] 1.1 Add `is_builtin` column to `event_sources` table (Alembic migration)
- [x] 1.2 Create `data_channels` table
- [x] 1.3 Create `sectors` table
- [x] 1.4 Mark existing 8 EventSources as builtin in seed script
- [x] 1.5 Seed default data channels (akshare, eastmoney, yahoo)
- [x] 1.6 Seed CSRC sector classifications into `sectors` table

## 2. Backend — Data Channel API

- [x] 2.1 Create `DataChannel` model in `server/src/models/models.py`
- [x] 2.2 Create `DataChannel` CRUD in `server/src/models/crud.py`
- [x] 2.3 Create `server/src/api/data_channels.py` with GET/POST/PUT/DELETE endpoints
- [x] 2.4 Register router in `server/src/main.py`

## 3. Backend — Sector API

- [x] 3.1 Create `Sector` model in `server/src/models/models.py`
- [x] 3.2 Create `Sector` CRUD in `server/src/models/crud.py`
- [x] 3.3 Create `server/src/api/sectors.py` with GET/POST/PUT/DELETE endpoints
- [x] 3.4 Register router in `server/src/main.py`

## 4. Backend — Fetcher Implementations

- [x] 4.1 Implement `StockPriceFetcher` (watchlist daily prices)
- [x] 4.2 Implement `StockFundamentalFetcher` (watchlist fundamentals)
- [x] 4.3 Implement `SectorRotationFetcher` (enabled sectors)
- [x] 4.4 Implement `InternationalFetcher` (world indices via yahoo)
- [x] 4.5 Register all new fetchers in `FETCHER_REGISTRY`

## 5. Backend — EventSource Protection & Enhancements

- [x] 5.1 Update `delete_event_source` API to reject deletion of `is_builtin=1` sources
- [x] 5.2 Update seed script to set `is_builtin=1` for default sources
- [x] 5.3 Update `GET /event-sources` to include `is_builtin` field

## 6. Backend — Collection Monitoring Enhancement

- [x] 6.1 Update `GET /event-jobs` to support filtering by `source_id`
- [x] 6.2 `trigger_event_source` returns detailed error messages

## 7. Frontend — Data Collection Page Refactor

- [x] 7.1 Update `DataCollection.tsx` to 4 Tabs: 采集源 / 采集监控 / 渠道管理 / 板块管理
- [x] 7.2 "采集源" Tab: show `is_builtin` badge, disable delete for builtin sources
- [x] 7.3 "渠道管理" Tab: channel CRUD table + create/edit modal
- [x] 7.4 "板块管理" Tab: sector list with enable/disable toggles
- [x] 7.5 "采集监控" Tab: unified EventJob+CollectionJob view with status filter

## 8. Frontend — API Updates

- [x] 8.1 Add `dataChannelApi` to `client/src/services/api.ts`
- [x] 8.2 Add `sectorApi` to `client/src/services/api.ts`
- [x] 8.3 Add `is_builtin` to `EventSource` type

## 9. Testing

- [x] 9.1 Backend tests: `cd server && PYTHONPATH=. pytest -v` — 74 passed, 1 pre-existing failure
- [x] 9.2 Frontend tests: `cd client && pnpm run test` — 11 passed, 3 pre-existing failures, no regressions
