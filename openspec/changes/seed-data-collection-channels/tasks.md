## 1. Seed Data & Backend Fixes

- [x] 1.1 Review and fix `seed_data_defaults.py` to ensure all data sources have correct `is_builtin=1` and categories
- [x] 1.2 Verify `DEFAULT_CHANNELS` include `data_source_id` mapping, `collection_method`, `endpoint`, and valid `config`
- [x] 1.3 Fix `src/api/events.py` `GET /api/event-sources` to return all `is_builtin=1` sources (remove external filter)
- [x] 1.4 Fix `src/api/data_channels.py` to ensure CRUD works with new model fields (`collection_method`, `data_source_id`, `enabled`)
- [x] 1.5 Fix `src/services/scheduler.py` to read channels from `DataChannel` table with `enabled=1` check
- [x] 1.6 Add sector-based filtering in sector rotation fetcher (only fetch enabled sectors)
- [x] 1.7 Run backend syntax check (`python -m py_compile`)

## 2. Frontend Fixes

- [x] 2.1 Fix `DataSourceList.tsx` to remove "内置" tags and migration alerts; ensure channel toggle works
- [x] 2.2 Fix `DataSourceList.tsx` expandable rows to show channels with `collectionMethod`, `endpoint`, and `enabled` switch
- [x] 2.3 Fix `ChannelManagement.tsx` to use `collectionMethod` instead of `source_type`; show `endpoint`
- [x] 2.4 Fix `ChannelManagement.tsx` create/edit modal to include `data_source_id` dropdown
- [x] 2.5 Fix `CollectionMonitoring.tsx` list view to show `dataSourceName` correctly
- [x] 2.6 Fix `api.ts` type definitions to match new `ChannelItem` interface (`collectionMethod`, `dataSourceId`, etc.)
- [x] 2.7 Run frontend build (`pnpm run build`) and fix any TypeScript errors

## 3. Integration Testing

- [x] 3.1 Run `docker-compose up -d --build` and verify application starts
- [x] 3.2 Verify `数据管理` page loads with 5 tabs (数据源, 渠道管理, 事件查询, 采集监控, 板块管理)
- [x] 3.3 Verify 数据源 tab shows all 6 data sources with expandable channel lists
- [x] 3.4 Verify channel toggle (enable/disable) persists after page refresh
- [x] 3.5 Verify 渠道管理 tab shows all channels with correct data source name
- [x] 3.6 Verify 采集监控 tab shows channel-level aggregated statistics
- [x] 3.7 Verify 板块管理 tab shows CSRC sector list with enable/disable switches
- [x] 3.8 Trigger manual collection from a data source and verify job appears in monitoring
- [x] 3.9 Check scheduler logs (`docker-compose logs -f server`) for automatic collection execution

## 4. Automated Tests

- [x] 4.1 Run backend unit tests (`PYTHONPATH=. pytest tests/ -v --ignore=tests/e2e`) and fix failures
- [x] 4.2 Update `test_channels.py` to match new API paths and model fields
- [x] 4.3 Run frontend unit tests (`cd client && pnpm run test`) and fix failures
- [x] 4.4 Verify all new/modified APIs return correct response format

## 5. Documentation & Cleanup

- [x] 5.1 Update `client/public/docs/data-management.md` to reflect current data source/channel structure
- [x] 5.2 Update `AGENTS.md` if any developer commands or conventions changed
- [x] 5.3 Remove any debug/placeholder code introduced during testing
- [x] 5.4 Run pre-commit hooks (`pre-commit run --all-files`) to auto-fix style issues
