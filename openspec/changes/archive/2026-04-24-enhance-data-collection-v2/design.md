## Context

当前 `FETCHER_REGISTRY` 仅支持3个 `source_type`：`stock_news`、`stock_notice`、`macro_data`。seed脚本创建了8个EventSource，其中4个（`stock_price`、`stock_fundamental`、`sector_data`、`international`）没有对应的Fetcher，采集必然失败。

现有架构中，EventSource 直接通过 `config.source` 指定渠道（如 "eastmoney"），渠道配置硬编码在 config JSON 中，没有统一的渠道管理能力。板块数据也没有独立的管理模型。

## Goals / Non-Goals

**Goals:**
- 实现4个缺失的 Fetcher，使所有内置数据源可正常采集
- 建立渠道管理抽象层，支持用户配置和维护采集渠道
- 建立板块管理模型，支持用户自定义采集的板块范围
- 内置数据源不可删除，但可编辑调度配置
- 采集监控支持按数据源分类和查看采集数据详情

**Non-Goals:**
- 不改造现有的 `stock_news`/`stock_notice`/`macro_data` Fetcher（它们已有基础实现，本变更不重构）
- 不实现实时采集推送（仍通过 Scheduler 定时触发）
- 不新增除证监会以外的板块分类来源
- 不实现采集数据的人工编辑/修改

## Decisions

### 1. DataChannel 模型独立存在，不与 EventSource 直接外键关联
- **Rationale**: EventSource.config 中已经通过 `"source": "akshare"` 指定渠道。DataChannel 提供渠道的统一配置（如 akshare 的超时、代理等），Fetcher 运行时根据 config.source 查找对应渠道配置。这保持了现有 EventSource 表结构不变，只在需要时查询渠道。
- **Alternative**: 在 EventSource 上增加 `channel_id` 外键 — rejected，需要大规模迁移现有数据。

### 2. Sector 表复用并扩展 `stock_sector_mappings`
- **Rationale**: 现有 `stock_sector_mappings` 表已有 `sector`、`sector_code`、`industry_level1/2` 等字段，但它是 stock→sector 的映射表，不是 sector 本身的分类表。新增独立的 `sectors` 表，包含 `code`、`name`、`level`、`parent_id`、`is_enabled`、`source`，与 `stock_sector_mappings` 通过 sector_code 关联。
- **Alternative**: 扩展 `stock_sector_mappings` 增加 is_enabled — rejected，映射表和分类表职责不同。

### 3. 采集数据详情通过单独 API 查询，不存储额外快照表
- **Rationale**: 个股行情数据已存入 `stock_daily_prices`，财务数据已存入 `stock_fundamentals`，板块数据可通过 akshare 实时查询。采集监控的「查看详情」直接查询这些已有表，或展示最近一次采集的原始数据（存储在 EventJob.logs 中）。
- **Alternative**: 新增采集数据快照表 — rejected，会引入数据冗余，且已有专门的数据表。

### 4. 内置 Fetcher 直接调用 stock_service / fundamental_service 复用逻辑
- **Rationale**: `stock_price` 采集本质上就是每日收盘后拉取行情，`stock_fundamental` 就是拉取财务数据。这些逻辑在 `stock_data.py` 和 `fundamental_service.py` 中已有实现，Fetcher 只需调用现有服务并创建 EventJob 记录进度。
- **Alternative**: 在 Fetcher 中重写采集逻辑 — rejected，代码重复，维护困难。

## Risks / Trade-offs

- **[Risk] akshare API 不稳定导致 Fetcher 频繁失败** → **Mitigation**: DataChannel 配置支持 timeout 和 retry 设置；Fetcher 捕获异常并记录到 EventJob.error_message。
- **[Risk] Sector 表数据量大（证监会约 90 个行业）影响加载性能** → **Mitigation**: 前端分页加载；后端按需查询启用的 sector。
- **[Risk] 国际市场数据依赖 yfinance，有频率限制** → **Mitigation**: DataChannel 配置代理设置；Fetcher 增加请求间隔（sleep 1s between requests）。
- **[Trade-off] EventJob 模型不区分采集数据类型，详情查看需要按 source_type 路由到不同表** → 在 API 层根据 EventSource.source_type 返回对应格式的数据，前端自适应渲染。

## Migration Plan

1. 执行 Alembic migration：新增 `is_builtin` 到 `event_sources`，创建 `data_channels` 和 `sectors` 表
2. 运行 seed 脚本：创建默认渠道配置、证监会板块分类、标记现有内置 source
3. 部署新版 backend 和 frontend
4. 回滚：回滚 migration，恢复旧版本镜像

## Open Questions

1. `sector_data` Fetcher 采集的数据应该存入哪张表？（当前决策：暂存 Redis + 展示在详情中，不入关系库，因为板块数据是高频变化的日内数据）
2. `international` Fetcher 采集的全球指数数据是否应该存入 `stock_daily_prices`？（当前决策：使用 Redis 缓存，不入 stock_daily_prices，因为指数代码格式与 A 股不同）
