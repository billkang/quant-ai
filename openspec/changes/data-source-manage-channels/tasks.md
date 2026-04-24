## 1. Database Migration & Model

- [x] 1.1 Create Alembic migration: add `source_channel_links` table with `(source_id, channel_id)` composite unique index
- [x] 1.2 Add migration data: `INSERT INTO source_channel_links SELECT data_source_id, id FROM data_channels WHERE data_source_id IS NOT NULL`
- [x] 1.3 Update `DataChannel` model: `data_source_id` → `nullable=True`
- [x] 1.4 Update `EventSource` model: add `SourceChannelLink` association table
- [x] 1.5 Add CRUD helpers: `link_channel_to_source`, `unlink_channel_from_source`, `get_selected_channels_by_source`, `get_source_ids_for_channel`

## 2. Backend APIs

- [x] 2.1 Add `GET /api/event-sources/{id}/channels` endpoint — return channels linked to source
- [x] 2.2 Add `POST /api/event-sources/{id}/channels` endpoint — batch link channels (accept `{channel_ids: []}`)
- [x] 2.3 Add `DELETE /api/event-sources/{id}/channels/{channel_id}` endpoint — unlink single channel
- [x] 2.4 Modify `GET /api/event-sources` — include `selected_channel_ids` in each source response
- [x] 2.5 Modify `GET /api/event-sources/{id}` — include `selected_channel_ids` in detail response (same endpoint now includes it)
- [x] 2.6 Modify `POST /api/event-sources/{id}/trigger` — execute selected channels first, fallback to default channels
- [x] 2.7 Modify `GET /api/channels` — add `referencingSourceIds` / `referencingSourceNames` fields
- [x] 2.8 Run backend syntax check (`python -m py_compile`)

## 3. Scheduler & Monitoring

- [x] 3.1 Update `run_news_collection_job` — for each source, use selected channels if any; fallback to default
- [x] 3.2 Update `get_event_jobs_monitor` — `dataSourceName` shows comma-separated referencing sources for shared channels
- [x] 3.3 Ensure scheduler logs show correct channel names during multi-source execution

## 4. Frontend — DataSourceList

- [x] 4.1 Add `sourceChannelApi` methods: `getSourceChannels`, `linkChannels`, `unlinkChannel`
- [x] 4.2 Update `DataSourceList.tsx` expandable row: add `Select mode="multiple"` for channel selection
- [x] 4.3 Implement `handleSelectChannels(sourceId, channelIds)` — call batch link API
- [x] 4.4 Remove old passive channel display (replace with editable multi-select)
- [x] 4.5 Ensure channel toggle (enable/disable) still works within expandable row

## 5. Frontend — ChannelManagement

- [x] 5.1 Update `ChannelManagement.tsx` columns: add "被引用数据源" column showing referencing source names
- [x] 5.2 Update `ChannelManagement.tsx` create/edit modal: keep `data_source_id` as default归属 dropdown

## 6. Frontend — Types & Build

- [x] 6.1 Update `types/api.ts`: add `selectedChannelIds` to `EventSource`; add `referencingSourceIds` to `ChannelItem`
- [x] 6.2 Update `services/api.ts`: add `sourceChannelApi` helper
- [x] 6.3 Run frontend build (`pnpm run build`) and fix TypeScript errors
- [x] 6.4 Run frontend unit tests (`pnpm run test`)

## 7. Integration Testing

- [x] 7.1 Run `docker-compose up -d --build` and verify application starts
- [x] 7.2 Verify existing seed data auto-migrated to `source_channel_links`
- [x] 7.3 Verify data source expand row shows multi-select with correct pre-selected channels
- [x] 7.4 Select a new channel for a source, refresh page, verify selection persisted
- [x] 7.5 Remove a channel from a source, verify it's removed but channel still exists
- [x] 7.6 Associate same channel to two sources, verify both show it
- [x] 7.7 Trigger manual collection, verify only selected channels execute (check EventJob channel_id)
- [x] 7.8 Trigger source with NO selected channels, verify fallback to default channels works
- [x] 7.9 Verify ChannelManagement shows correct referencing sources for shared channels

## 8. Automated Tests

- [x] 8.1 Add backend tests for `GET/POST/DELETE /api/event-sources/{id}/channels`
- [x] 8.2 Add backend test: trigger respects selected channels
- [x] 8.3 Add backend test: trigger fallback when no selected channels
- [x] 8.4 Update `test_channels.py` to test `referencing_source_ids` in channel list
- [x] 8.5 Run full backend unit tests (`PYTHONPATH=. pytest tests/ -v --ignore=tests/e2e`)

## 9. Documentation & Cleanup

- [x] 9.1 Update `client/public/docs/data-management.md`: document data source channel selection feature
- [x] 9.2 Remove debug/placeholder code
- [x] 9.3 Run pre-commit hooks (`pre-commit run --all-files`)
