## 1. Backend Fixes

- [x] 1.1 Update `run_fetcher` in `server/src/services/event_fetchers.py` to catch `ValueError` for unknown source_type and return `{"status": "error", "message": "..."}` instead of raising
- [x] 1.2 Update `trigger_event_source` in `server/src/api/events.py` to return error details gracefully when fetch fails
- [x] 1.3 Add `source_id` query param to `GET /api/event-jobs` in `server/src/api/events.py`

## 2. Frontend — Unified Data Collection Page

- [x] 2.1 Create `client/src/pages/DataCollection.tsx` with Tab layout ("采集源" / "采集监控")
- [x] 2.2 Implement "采集源" Tab: EventSource table with columns (name, type, scope, schedule, enabled, last_fetched_at, action)
- [x] 2.3 Add "新建数据源" Modal (reuse existing form fields from EventSourcesPage)
- [x] 2.4 Add "编辑" action to EventSource row (opens edit Modal)
- [x] 2.5 Add "采集" action with error message display (not just "采集失败")
- [x] 2.6 Add "删除" action with Popconfirm
- [x] 2.7 Implement source detail Drawer: basic info (read-only) + historical EventJob list for this source
- [x] 2.8 Implement "采集监控" Tab: unified table showing EventJob + CollectionJob with status filter

## 3. Navigation & Routing

- [x] 3.1 Update `client/src/components/Layout.tsx`: replace 「数据源配置」「采集任务」「采集监控」 with single 「数据采集」 entry
- [x] 3.2 Update `client/src/App.tsx`: add `/data-collection` route, redirect `/event-sources` `/event-jobs` `/collection-jobs` to `/data-collection`
- [x] 3.3 Update `client/src/services/api.ts`: add `sourceId` param to `eventApi.getJobs`

## 4. Cleanup

- [x] 4.1 Old routes kept as redirects to `/data-collection`

## 5. Testing

- [x] 5.1 Backend tests: `cd server && PYTHONPATH=. pytest -v` — 74 passed, 1 pre-existing failure
- [x] 5.2 Frontend tests: `cd client && pnpm run test` — same pre-existing failures, no new regressions
