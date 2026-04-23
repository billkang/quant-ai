## Why

当前系统的事件因子能力缺失：回测引擎只能使用硬编码的 3 个技术指标策略，无法接入外部事件信号；新闻数据仅以原始文本存储，未转化为可参与策略计算的量化因子。为了支撑"研究闭环"（数据→策略→回测→分析），必须构建一套可管理、可扩展的三级事件因子系统（个股/板块/市场），使策略能够同时利用技术因子和事件因子进行信号生成。

## What Changes

- **新增事件因子核心系统**：三级事件采集管道（个股新闻/公告、板块政策、市场宏观/国际事件），日级聚合生成事件因子，并与技术指标对齐为因子快照
- **新增策略管理模块**：策略 CRUD、版本管理、结构化参数定义，取代现有的 3 个硬编码策略
- **改造回测引擎**：输入从原始价格数据改为 factor_snapshots（技术+事件），支持参数化策略运行
- **改造资产组合为虚拟持仓**：`positions` 表关联回测任务，不再代表真实交易
- **重做 Dashboard**：从"资产组合看板"改为"研究概览"（策略数、回测数、最近任务、收益排行）
- **新增管理后台页面**：数据源配置、采集任务日志、提取规则管理、事件查询
- **BREAKING**: `strategy_backtests` 表结构扩展（新增 strategy_id, progress, factor_snapshot_ids 等字段）
- **BREAKING**: 删除 `stock_kline` JSON blob 表，统一使用 `stock_daily_prices`

## Capabilities

### New Capabilities
- `event-factor`: 事件因子核心系统，包含事件采集、提取、聚合、快照生成全链路
- `strategy-management`: 策略定义、版本管理、参数 Schema、内置策略库
- `factor-snapshot`: 技术因子与事件因子的日级对齐快照，为回测和 AI 诊断提供统一输入
- `virtual-portfolio`: 策略虚拟持仓，关联回测任务跟踪模拟持仓状态

### Modified Capabilities
- `quantitative`: 回测引擎输入从原始价格改为 factor_snapshots，策略从硬编码改为可配置参数化策略
- `portfolio`: 持仓从真实交易改为虚拟持仓（关联 backtest_task），页面展示逻辑调整
- `stock-data`: 新增日级事件因子聚合查询接口

## Impact

- **后端**: 新增 8 张数据库表（events, event_sources, event_jobs, event_rules, event_factors, factor_snapshots, strategies, strategy_versions），改造 backtest_tasks 表
- **API**: 新增 `/api/events`, `/api/event-sources`, `/api/event-jobs`, `/api/event-rules`, `/api/strategies`, `/api/factors/snapshots` 等路由
- **前端**: 新增/改造 5 个页面（事件查询、数据源配置、采集任务、规则管理、策略管理），重做 Dashboard
- **调度**: APScheduler 增加事件采集任务调度
- **数据源**: akshare（新闻/公告/宏观），预留国际事件 API 接口
- **AI**: 为后续 LangGraph Agents 预留 `/api/events/agent-context` 接口
