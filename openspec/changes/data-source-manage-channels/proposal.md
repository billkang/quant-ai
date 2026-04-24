## Why

目前每个采集渠道（`DataChannel`）通过 `data_source_id` 固定绑定到单一数据源（`EventSource`），用户在数据源页面只能「查看」关联渠道，无法主动「选择」或「配置」该数据源使用哪些渠道。同时，一个渠道无法被多个数据源复用。需要引入数据源对渠道的多选机制，让用户可以在数据源维度灵活配置采集范围。

## What Changes

- **新增关联表**：创建 `source_channel_links` 关联表，实现数据源与渠道的多对多关系。
- **修改数据模型**：在 `EventSource` 和 `DataChannel` 之间建立显式的多对多关联，同时保留 `data_source_id` 作为默认归属（向后兼容）。
- **新增 API**：
  - `GET /api/event-sources/{id}/channels` — 获取数据源已选择的渠道列表
  - `POST /api/event-sources/{id}/channels` — 为数据源添加渠道关联
  - `DELETE /api/event-sources/{id}/channels/{channel_id}` — 移除数据源与渠道的关联
- **修改现有 API**：
  - `GET /api/event-sources` 返回时包含 `selected_channel_ids` 字段
  - `POST /api/event-sources/{id}/trigger` 触发采集时，优先运行该数据源已选择的渠道；若未选择任何渠道，则回退到该数据源下所有 `enabled=1` 的渠道
- **前端改造**：
  - `DataSourceList.tsx` 展开行增加「选择渠道」功能（多选下拉框或 Transfer 组件）
  - `ChannelManagement.tsx` 显示每个渠道被哪些数据源引用
- **移除旧约束**：`DataChannel` 的 `data_source_id` 改为可空（nullable），逐步弱化为「默认归属」而非强制绑定

## Capabilities

### New Capabilities

- `data-source-channel-selection`：数据源可以选择多个采集渠道，渠道可被多个数据源复用；支持通过 API 和 UI 管理数据源与渠道的关联关系

### Modified Capabilities

- `data-collection-source-management`：数据源列表和详情接口需要返回已关联的渠道 ID 列表；触发采集逻辑需要根据已选渠道执行
- `data-collection-monitoring`：监控中的渠道统计需要支持同一渠道出现在多个数据源下的场景

## Impact

- **后端**：新增 migration（`source_channel_links` 表）、修改 `src/models/models.py`、`src/api/events.py`、`src/services/scheduler.py`
- **前端**：修改 `DataSourceList.tsx`、`ChannelManagement.tsx`，可能需要新增 `SourceChannelSelector` 组件
- **数据库**：需要迁移已有 `data_source_id` 关系到 `source_channel_links` 表作为初始数据
- **调度器**：`run_news_collection_job` 和手动触发逻辑需要按「数据源→已选渠道」执行
- **测试**：新增关联关系 CRUD 测试；更新现有 trigger 和 monitor 测试
