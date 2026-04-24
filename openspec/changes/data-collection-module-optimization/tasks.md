## 1. Database Migration

- [x] 1.1 Create Alembic migration to add `category` enum field (`stock_info`, `global_event`) to `event_sources` (or `channels`) table
- [x] 1.2 Create data migration script to categorize existing external fetchers (Eastmoney news, Eastmoney announcements, A-share macro data, HK stock news) into correct categories
- [x] 1.3 Ensure `enabled` field exists on channel table and has correct default values
- [x] 1.4 Run migration and verify schema in local Docker environment

## 2. Backend API - Channel Management

- [x] 2.1 Create/update Pydantic schemas for channel CRUD with `category` and `enabled` fields
- [x] 2.2 Implement or update `GET /api/channels` endpoint with category filter support
- [x] 2.3 Implement or update `POST /api/channels` endpoint for creating channels with category
- [x] 2.4 Implement or update `PUT /api/channels/{id}` endpoint for editing channel category and enabled status
- [x] 2.5 Implement or update `DELETE /api/channels/{id}` endpoint
- [x] 2.6 Add activation toggle endpoint or integrate into PUT: `enabled` field update
- [x] 2.7 Update scheduler service to skip channels where `enabled = false`

## 3. Backend API - Collection Monitoring

- [x] 3.1 Update `GET /api/event-jobs` endpoint to support filter query params: `start_date`, `end_date`, `collection_type` (auto/manual), `source_id`, `channel_id`
- [x] 3.2 Implement tree-structured aggregation endpoint or modify existing endpoint to return nested data: source → channel → data items
- [x] 3.3 Implement lazy-loading sub-endpoint: `GET /api/event-jobs/{source_id}/channels` to load channels under a source
- [x] 3.4 Implement lazy-loading sub-endpoint: `GET /api/event-jobs/{source_id}/channels/{channel_id}/items` to load individual data items
- [x] 3.5 Add aggregated statistics (total jobs, success/failure counts) to source/channel nodes in tree response

## 4. Backend API - Data Source List

- [x] 4.1 Update `GET /api/event-sources` (or equivalent data source list endpoint) to exclude external fetcher configurations
- [x] 4.2 Ensure only built-in system data sources are returned (market data, K-line)
- [ ] 4.3 Add API documentation updates if needed

## 5. Frontend - Unified Data Management Module

- [x] 5.1 Create new `DataManagement.tsx` page component with Ant Design Tabs for sub-functions
- [x] 5.2 Create tab contents: "数据源", "渠道管理", "事件查询", "采集监控"
- [x] 5.3 Implement route for `/data-management` and redirect legacy routes (`/data-collection`, `/event-query`) to corresponding tabs
- [x] 5.4 Update `Layout.tsx` navigation menu: replace standalone entries with unified "数据管理" entry

## 6. Frontend - Data Source List Page

- [x] 6.1 Refactor data source list component to display only built-in sources
- [x] 6.2 Remove external fetcher entries (Eastmoney news, announcements, macro data, HK news) from the list view
- [x] 6.3 Add hint/link directing users to "渠道管理" for managing external fetchers

## 7. Frontend - Channel Management Page

- [x] 7.1 Build channel management table with category grouping or category filter
- [x] 7.2 Add activation toggle (checkbox/switch) in each channel row
- [x] 7.3 Implement create/edit modal for channels with category selection dropdown
- [x] 7.4 Connect to backend CRUD APIs (`/api/channels`)
- [ ] 7.5 Display channel-to-data-source mapping information in channel details

## 8. Frontend - Collection Monitoring Page

- [x] 8.1 Add filter bar with: date range picker, collection type select (auto/manual), source dropdown, channel dropdown
- [x] 8.2 Implement tree-structured monitoring view using Ant Design Tree or nested expandable Table
- [x] 8.3 Implement root level: collection sources with aggregated statistics
- [x] 8.4 Implement second level: channels under each source (lazy-loaded on expand)
- [x] 8.5 Implement leaf level: individual collected data items with title, time, status (lazy-loaded on expand)
- [x] 8.6 Add detail panel or modal for viewing full content of a collected data item
- [x] 8.7 Connect filter states to backend query params

## 9. Frontend - Event Query Integration

- [x] 9.1 Move existing event query page content into the "事件查询" tab of Data Management module
- [x] 9.2 Ensure all existing event query features (filters, edit, delete, trigger) function correctly within the tab
- [x] 9.3 Verify event query deep-linking works when accessed via redirect from legacy route

## 10. Documentation

- [x] 10.1 Merge or rewrite `client/public/docs/data-collection.md`, `client/public/docs/events.md`, and `client/public/docs/data-management.md` into unified documentation
- [x] 10.2 Update `client/src/docs/config.ts` navigation config if document paths or titles change
- [x] 10.3 Add documentation for new channel management features (category, activation)
- [x] 10.4 Add documentation for collection monitoring filters and tree view

## 11. Testing

- [x] 11.1 Write backend unit tests for channel CRUD APIs and category filter
- [x] 11.2 Write backend unit tests for collection monitoring filter and tree aggregation logic
- [ ] 11.3 Write backend E2E tests covering channel activation/deactivation and scheduler behavior
- [ ] 11.4 Write frontend unit tests for Data Management tab switching and route redirection
- [ ] 11.5 Write Playwright E2E tests for full user flow: navigate to data management → manage channels → view collection monitoring with filters and tree expansion
- [x] 11.6 Run full test suite (`cd server && PYTHONPATH=. pytest -v`, `cd client && pnpm run test`) and fix failures

## 12. Deployment Verification

- [ ] 12.1 Run `docker-compose up -d --build` and verify application starts correctly
- [ ] 12.2 Verify navigation menu displays unified "数据管理" entry
- [ ] 12.3 Verify legacy route redirects work
- [ ] 12.4 Verify channel categorization and activation toggles persist after restart
- [ ] 12.5 Verify collection monitoring tree view loads correctly with real data
