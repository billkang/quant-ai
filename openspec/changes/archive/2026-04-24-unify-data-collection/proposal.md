## Why

当前系统中与数据采集相关的功能分散在三个独立页面：「数据源配置」管理事件因子采集源、「采集任务」查看事件因子采集日志、「采集监控」查看股票/新闻采集任务。这三个入口在导航中各自独立，功能割裂，用户需要在不同页面间跳转才能完成与数据采集相关的操作。此外，「数据源配置」页面缺少编辑功能，点击「采集」按钮后仅提示"采集失败"而无具体错误信息，导致问题排查困难。因此需要将采集相关的所有功能聚合到一个统一的「数据采集」页面中，提升操作效率和用户体验。

## What Changes

- **合并导航入口**：将「数据源配置」「采集任务」「采集监控」三个导航项合并为单一的「数据采集」入口
- **重做「数据采集」页面**：新页面采用 Tab 布局，包含「采集源」和「采集监控」两个 Tab
  - 「采集源」Tab：展示 EventSource 列表，支持新建、编辑（Modal）、删除、启用/禁用、手动采集，点击某行可展开/Drawer 查看该源的详情（基本信息 + 历史采集任务列表）
  - 「采集监控」Tab：展示所有采集任务的统一视图（EventJob + CollectionJob），支持状态筛选和进度查看
- **修复采集报错**：`run_fetcher` 对未知 source_type 返回友好错误而非抛 500；前端展示具体错误信息
- **新增 EventSource 编辑 API 前端对接**：现有后端已支持 `PUT /event-sources/{id}`，前端补充编辑 Modal
- **新增按 source 查询 EventJob API**：`GET /event-jobs?source_id={id}` 支持按数据源筛选任务
- **移除旧页面路由**：删除 `/event-sources`、`/event-jobs`、`/collection-jobs` 独立路由（重定向到 `/data-collection`）

## Capabilities

### New Capabilities
- `data-collection-page`: 统一数据采集管理页面（采集源列表 + 采集监控 + 源详情 Drawer）

### Modified Capabilities
- `event-factor`: EventSource 采集报错修复、按 source 筛选 EventJob、导航入口变更

## Impact

- **前端**: 新增 `client/src/pages/DataCollection.tsx`（统一页面），删除/弃用 `EventSourcesPage.tsx`、`EventJobsPage.tsx`、`CollectionJobs.tsx` 的独立路由；更新 `Layout.tsx` 导航
- **后端**: 修改 `server/src/services/event_fetchers.py`（错误处理）；修改 `server/src/api/events.py`（EventJob 列表增加 source_id 筛选参数）
- **路由**: App.tsx 中 `/data-collection` 替换原有的三个独立路由
