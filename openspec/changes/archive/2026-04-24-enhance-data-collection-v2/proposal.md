## Why

当前系统的8个内置EventSource中，有4个（个股行情、个股财务、板块轮动、国际市场）的`source_type`不在`FETCHER_REGISTRY`中，导致采集必然失败。此外，数据源与采集渠道之间没有明确的抽象层，板块分类无法由用户自定义，采集监控也缺乏按数据源分类和数据详情查看的能力。用户需要一个完整、可用的数据采集系统。

## What Changes

- **修复4个内置数据源的采集功能**：为 `stock_price`、`stock_fundamental`、`sector_data`、`international` 实现对应的 Fetcher
- **新增数据源渠道管理**：引入 `DataChannel` 模型和 CRUD API，管理 akshare/eastmoney/yahoo 等采集渠道的配置（API endpoint、headers、timeout、是否可用）
- **新增板块分类管理**：引入 `Sector` 模型和 CRUD API，基于证监会行业分类，支持用户启用/禁用/自定义板块
- **标记内置数据源不可删除**：EventSource 增加 `is_builtin` 字段，前端禁止删除内置源
- **「个股xxx」采集源关联 watchlist**：Fetcher 从 watchlist 获取股票池，支持用户通过自选股管理采集范围
- **「板块轮动数据」采集源关联 Sector 表**：Fetcher 从用户启用的 Sector 列表获取采集目标
- **「国际市场数据」采集源关联 DataChannel 渠道配置**
- **采集监控增强**：
  - 按数据源类型/渠道分类筛选
  - 列表显示数据源名称和渠道信息
  - 详情按钮查看采集回来的具体数据列表
- **新增前端页面**：
  - 「数据采集」页面重构：Tab 布局（采集源 / 采集监控 / 渠道管理 / 板块管理）
  - 「渠道管理」Tab：渠道 CRUD
  - 「板块管理」Tab：板块列表，支持启用/禁用/编辑

## Capabilities

### New Capabilities
- `data-channel-management`: 数据源渠道管理（模型、API、前端页面）
- `sector-management`: 板块分类管理（模型、API、前端页面）
- `stock-price-fetcher`: 个股行情数据采集实现
- `stock-fundamental-fetcher`: 个股财务数据采集实现
- `sector-data-fetcher`: 板块轮动数据采集实现
- `international-data-fetcher`: 国际市场数据采集实现

### Modified Capabilities
- `event-factor`: EventSource 模型增加 `is_builtin`；新增4个 Fetcher；修复采集失败
- `collection-scheduler`: 采集监控增强（分类筛选、数据源信息、数据详情查看）

## Impact

- **数据库**: 新增 `data_channels` 表和 `sectors` 表；`event_sources` 表增加 `is_builtin` 列
- **后端**: 新增4个 Fetcher；新增 `data_channel.py` 和 `sector.py` API；修改 `event_fetchers.py`、调度器
- **前端**: 重构 `DataCollection.tsx`；新增渠道管理和板块管理 Tab；增强采集监控
