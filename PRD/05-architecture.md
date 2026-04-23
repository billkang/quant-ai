# 05 — 系统架构与设计决策 (Architecture & Decisions)

> 权威来源：`openspec/changes/mvp-event-factor-core/design.md`
> 本文件记录当前系统架构的核心设计决策，以事件因子系统为核心。

---

## 1. 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React + AntD)                   │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Dashboard│ 策略管理  │ 回测报告  │ 事件因子  │   数据源配置     │
│ (研究概览)│ (CRUD)   │ (运行/历史)│ (查询)   │   (采集源/规则)  │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 层 (FastAPI)                        │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ /api/quant   │ /api/strategies│ /api/events │ /api/dashboard │
│ 指标/回测     │ 策略CRUD/版本  │ 事件查询    │ 研究概览       │
├──────────────┴──────────────┴──────────────┴────────────────┤
│ /api/event-sources  │  /api/event-jobs  │  /api/event-rules  │
│   数据源配置         │   采集任务日志     │   提取规则管理      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     服务层 (Services)                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│ EventPipeline   │ BacktestEngine  │ FactorSnapshotBuilder  │
│ Service         │ (改造)          │ (technical + events对齐)│
│ (采集/提取/聚合) │                 │                         │
├─────────────────┴─────────────────┴─────────────────────────┤
│ APScheduler (定时调度) │  去重引擎  │  情感分析器  │  板块映射器  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据层 (PostgreSQL)                      │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  events  │event_    │event_    │event_    │ factor_         │
│          │sources   │jobs      │rules     │ snapshots       │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│strategies│strategy_ │backtest_ │stock_    │ stock_          │
│          │versions  │tasks     │daily_    │ indicators      │
│          │          │          │prices    │                 │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│ users │ stocks │ news_articles (保留) │  (其余保留表省略)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心设计决策

### 2.1 事件模型：三级分层 + 统一存储

所有事件统一存入 `events` 表，通过 `scope` 字段区分级别：`individual`（个股）、`sector`（板块）、`market`（市场）。

- **Why**: 避免为每级事件维护独立表，查询和扩展更简单
- **Trade-off**: 板块级事件通过 `sector` 字段 + 证监会行业分类映射表关联到个股

### 2.2 日级聚合：event_factors 表

事件按 `symbol + trade_date` 日级聚合为 `event_factors`，包含 `individual_events`、`sector_events`、`market_events` 三个 JSON 字段 + `composite` 综合得分。

- **Why**: 策略回测使用日线数据，日级聚合天然对齐；JSON 列结构灵活
- **Trade-off**: 一天10条新闻直接参与回测会导致噪声大、去重难，日级聚合是合理折中

### 2.3 数据源按"类型"配置

一个 `EventSource` 配置覆盖多只股票（如"东方财富个股新闻"自动遍历股票池），而非每只股票一个配置。

- **Why**: 配置数量从 O(n) 降到 O(1)
- **股票池定义**: `watchlist + 回测过的股票`

### 2.4 去重策略：标题相似度（text distance > 0.85）

使用 `difflib.SequenceMatcher` 或 `rapidfuzz` 计算标题相似度。

- **Why**: 同一事件在不同来源标题略有差异，URL 去重会漏掉
- **Trade-off**: 计算成本略高于 URL hash，但准确性高，MVP 数据量不大可接受

### 2.5 情感分析：关键词词典（MVP）+ 可替换接口

MVP 使用预定义正负关键词词典 + 简单计分公式。规则存储在 `event_rules` 表中，可版本切换。

- **Why**: 零外部依赖、可解释、可人工调整
- **扩展**: 预留 `sentiment_extractor` 接口，后续可替换为 DeepSeek API 或 BERT 模型

### 2.6 回测输入：factor_snapshots 替代原始价格

回测引擎不再直接从 `stock_daily_prices` 获取数据，而是从 `factor_snapshots` 读取已对齐的技术因子 + 事件因子。

- **Why**: 确保可回放（deterministic）— 同一日期同一股票的因子值固定
- **Trade-off**: 需要预先生成 snapshot，首次回测某段历史如果不存在需要实时生成

### 2.7 板块映射：证监会行业分类

使用证监会行业分类标准建立 `stock_sector_mappings` 映射表。

- **Why**: 国内最权威的官方分类，akshare 可直接获取；申万分类更细但更新频繁

### 2.8 策略参数化：内置策略标识 + params_schema

MVP 策略逻辑仍为内置 Python 类，但策略定义通过 `strategies` 表管理，参数通过 `params_schema` 结构化定义。

- **Why**: 立即解决"硬编码"问题，用户可调参运行不同变体
- **扩展**: 为 V2 的代码编辑/AI 生成保留扩展空间

### 2.9 异步回测：预留字段，MVP 同步执行

`backtest_tasks` 表保留 `status`、`progress` 字段，但 MVP 回测 API 同步返回结果。

- **Why**: 个人版、单用户、MVP 阶段策略简单，回测通常几秒完成；引入 Celery 增加复杂度
- **扩展**: 表结构预留，后续无痛升级异步回测

---

## 3. 数据流

### 3.1 行情数据流

```
外部数据源 (AkShare / yfinance)
    → 数据适配器 → 标准化处理
    → PostgreSQL (stock_daily_prices / stock_indicators / stock_fundamentals)
    → API 服务 → 前端展示
```

### 3.2 事件因子数据流

```
EventSource 配置
    → EventPipelineService 采集 (StockNewsFetcher / StockNoticeFetcher / MacroDataFetcher)
    → 去重引擎 (标题相似度)
    → 情感分析器 / 事件分类器 / 板块映射器
    → events 表 (原始事件)
    → 日级聚合引擎 → event_factors 表
    → FactorSnapshotBuilder (technical + events 对齐)
    → factor_snapshots 表
    → 回测引擎 / AI 诊断
```

### 3.3 策略执行流

```
前端策略编辑/选择
    → API 保存 (strategies / strategy_versions)
    → 回测引擎加载策略 + factor_snapshots
    → 策略执行 (on_bar)
    → backtest_tasks 表存储结果
    → 虚拟持仓 positions 表更新
    → 前端展示回测报告
```

### 3.4 告警通知流

```
Scheduler Pipeline 扫描规则 / 价格触发
    → alerts 表写入告警
    → Celery 异步任务
    → 查询用户通知设置
    → 去重检查 (5分钟)
    → 按渠道发送:
        ├─ in_app → notifications 表 + WebSocket 推送
        ├─ email → SMTP 发送
        └─ webhook → HTTP POST
```

---

## 4. Migration Plan（MVP 事件因子核心）

1. **数据库迁移**: Alembic 新增表 + 改造 `strategy_backtests` → `backtest_tasks`
2. **数据填充**:
   - 初始化 `event_sources`（内置 5-6 个数据源配置）
   - 初始化 `event_rules`（情感词典 v1、分类规则 v1、板块映射 v1）
   - 从 akshare 同步证监会行业分类映射表
   - 批量生成历史 `factor_snapshots`（对用户 watchlist 股票）
3. **API 切换**: 新路由并行运行，旧路由逐步废弃
4. **前端切换**: 新页面开发完成后，路由替换
5. **Rollback**: 保留旧表（`strategy_backtests` 改名备份），新表出问题可快速回滚

---

## 5. Risks & Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 事件采集源不稳定（akshare 接口变更） | 每个采集器独立封装；采集失败记录到 `event_jobs` 日志，不阻塞其他源 |
| 情感词典精度有限 | 规则版本化管理，可快速迭代关键词；预留模型接口后续升级 |
| factor_snapshots 数据量大 | 只生成用户关注股票池的 snapshot；旧数据可归档 |
| 板块映射表过时 | 定期从 akshare 同步更新；用户可在规则管理中手动修正 |
| 国际事件抓取复杂 | MVP 先用预定义日历 + API 抓取；复杂源后续迭代 |
