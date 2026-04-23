# 04 — 变更计划与实施任务 (Changes & Tasks)

> 权威来源：`openspec/changes/` 下所有变更
> 本文件是项目当前最核心的实施路线图。所有开发工作应以 `openspec/changes/` 下的详细 tasks.md 为最终依据。

---

## 变更总览

| 变更 | 目录 | 优先级 | 状态 | 说明 |
|------|------|--------|------|------|
| **MVP 事件因子核心系统** | `changes/mvp-event-factor-core/` | P0 | 🚧 | 系统级重构，事件因子为核心 |
| 预警通知系统 | `changes/notification/` | P1 | 🚧 | 多渠道告警推送 |
| 模拟交易/虚拟盘 | `changes/paper-trading/` | P0 | 🚧 | 独立虚拟资金账户 |
| 实时行情推送 | `changes/realtime/` | P1 | 🚧 | WebSocket 行情+告警 |
| 研报与公告聚合 | `changes/research-report/` | P1 | 🚧 | 基本面数据增强 |

---

## 一、MVP 事件因子核心系统 (mvp-event-factor-core)

> 最核心、工程量最大的变更。重构现有量化分析基础设施，建立"研究闭环"。
> 详细设计见 `changes/mvp-event-factor-core/design.md`，完整任务清单见 `changes/mvp-event-factor-core/tasks.md`。

### 1.1 Why

当前系统事件因子能力缺失：回测引擎只能使用硬编码的 3 个技术指标策略，无法接入外部事件信号；新闻数据仅以原始文本存储，未转化为可参与策略计算的量化因子。

### 1.2 What Changes

- **新增事件因子核心系统**：三级事件采集管道（个股新闻/公告、板块政策、市场宏观/国际事件），日级聚合生成事件因子，并与技术指标对齐为因子快照
- **新增策略管理模块**：策略 CRUD、版本管理、结构化参数定义，取代现有的 3 个硬编码策略
- **改造回测引擎**：输入从原始价格数据改为 `factor_snapshots`（技术+事件），支持参数化策略运行
- **改造资产组合为虚拟持仓**：`positions` 表关联回测任务，不再代表真实交易
- **重做 Dashboard**：从"资产组合看板"改为"研究概览"（策略数、回测数、最近任务、收益排行）
- **新增管理后台页面**：数据源配置、采集任务日志、提取规则管理、事件查询
- **BREAKING**: `strategy_backtests` 表结构扩展
- **BREAKING**: 删除 `stock_kline` JSON blob 表，统一使用 `stock_daily_prices`

### 1.3 实施阶段

```
Phase 0: 事件因子核心（3周，最高优先级）
├── 数据库迁移（新增 8 张表）
├── 采集管道框架（EventPipelineService）
├── 个股级采集（东方财富新闻/公告）
├── 板块级采集（行业政策 + 证监会行业映射）
├── 市场级采集（宏观数据 + 国际事件）
├── 日级聚合引擎（event_factors 生成）
├── 因子快照生成（factor_snapshots）
├── 去重引擎（标题相似度）
├── 情感分析器（关键词词典）
├── 事件分类器（规则匹配）
├── 前端：数据源配置 / 采集任务 / 规则管理 / 事件查询
└── 调度集成（APScheduler）

Phase 1: 研究闭环（2周）
├── 策略管理 API + 前端
├── 策略版本管理
├── 回测引擎改造（factor_snapshots 输入）
├── 策略虚拟持仓改造
├── Dashboard 重做
└── 前端：策略管理 / 回测 / Dashboard

Phase 2: 优化（1周，可选）
├── 性能优化（因子快照预计算）
├── 测试补全（E2E + 单元测试）
└── Docker 验证
```

### 1.4 关键任务清单（摘要）

完整清单见 `changes/mvp-event-factor-core/tasks.md`，此处为一级摘要：

| # | 任务组 | 关键内容 |
|---|--------|----------|
| 1 | Database Migration | 新增 8 张表、改造 `strategy_backtests`、创建 `stock_sector_mappings`、seed 内置策略与规则 |
| 2 | Event Pipeline Core | EventSource/EventJob/EventRule CRUD、采集器注册、去重、情感分析、板块映射、日级聚合、APScheduler 集成 |
| 3 | Factor Snapshot System | FactorSnapshot 模型、Builder 服务、生成与查询 API、Scheduler 集成 |
| 4 | Strategy Management | Strategy/StrategyVersion 模型、CRUD API、参数校验、内置策略库、动态加载 |
| 5 | Backtest Engine Refactoring | 接入 factor_snapshots、参数化策略、兼容旧数据 |
| 6 | Virtual Portfolio | 改造 positions 为虚拟持仓、按回测任务分组、PnL 计算 |
| 7 | Event Management APIs | `/api/events`, `/api/event-sources`, `/api/event-jobs`, `/api/event-rules` 全量接口 |
| 8 | Dashboard Redesign | 研究概览 API + 前端重做 |
| 9 | Frontend Pages | 事件查询、数据源配置、采集任务、规则管理、策略管理、回测、虚拟持仓页面 |
| 10 | Testing & Validation | 单元测试、E2E 测试、Docker 全栈验证 |
| 11 | Data Seeding | 内置策略 seed、默认数据源/规则 seed、行业映射 seed、历史 snapshot 生成 |

---

## 二、预警通知系统 (notification)

> 详细任务见 `changes/notification/tasks.md`

| # | 任务 | 关键内容 |
|---|------|----------|
| 1 | 数据模型 | `NotificationSetting`, `Notification` 模型 + Alembic migration |
| 2 | API 实现 | `GET/PUT /api/notifications/settings`, `GET /api/notifications/history`, `PUT /api/notifications/{id}/read`, `POST /api/notifications/test` |
| 3 | Celery 集成 | celery 依赖、`celery_app.py`、通知发送 task、去重逻辑（5分钟） |
| 4 | 前端 | `Settings.tsx` 通知设置页、Layout 铃铛 + Badge、WebSocket toast |
| 5 | 测试 | 后端单元测试、E2E 完整流程测试 |

---

## 三、模拟交易/虚拟盘 (paper-trading)

> 详细任务见 `changes/paper-trading/tasks.md`

| # | 任务 | 关键内容 |
|---|------|----------|
| 1 | 数据模型 | `PaperAccount`, `PaperPosition`, `PaperOrder` 模型 + Alembic migration |
| 2 | API 实现 | `GET /api/paper/account`, `GET /api/paper/positions`, `POST /api/paper/orders`, `GET /api/paper/orders`, `POST /api/paper/reset` |
| 3 | 前端 | `PaperTrading.tsx`、账户概览、持仓列表、下单弹窗、交易记录、重置按钮 |
| 4 | 测试 | 后端单元测试（订单撮合、盈亏计算）、E2E 完整流程测试 |

---

## 四、实时行情推送 (realtime)

> 详细任务见 `changes/realtime/tasks.md`

**关键内容**:
- `WS /api/ws/market` WebSocket 连接
- 客户端订阅消息：`{ action: "subscribe", codes: [...] }`
- Redis Pub/Sub 作为消息总线
- 推送类型：`quote`（行情）、`alert`（告警）
- HTTP 轮询降级兜底
- Dashboard / StockDetail / Alerts 前端适配

---

## 五、研报与公告聚合 (research-report)

> 详细任务见 `changes/research-report/tasks.md`

**关键内容**:
- `GET /api/research/reports`, `GET /api/research/notices`
- 数据模型：`research_reports`, `stock_notices`
- StockDetail 增加研报/公告 Tab
- News 页面"股票公告"和"宏观资讯"改为真实数据
- Scheduler 每日 15:35 拉取

---

## 版本规划对照

| 版本 | 内容 | 状态 |
|------|------|------|
| V1 (MVP) | 事件因子核心 + 策略管理 + 回测改造 + Dashboard 重做 + 虚拟持仓 | 🚧 当前目标 |
| V2 (后续) | AI 策略生成、多策略对比、LangGraph Agents、异步回测、事件因子效果回测 | 📋 待排期 |
