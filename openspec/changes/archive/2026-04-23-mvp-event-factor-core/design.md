## Context

当前系统已有新闻抓取（`news.py` / `news_service`）、技术指标计算（`indicator.py` / `StockIndicator`）、硬编码回测引擎（`backtest_service.py` 仅支持 MA/RSI/MACD 三个策略）和 Dashboard（模拟资产组合数据）。事件因子完全缺失：新闻以原始文本存储，未转化为结构化信号；策略无法接入外部事件；回测无法使用因子对齐数据。

本设计构建以事件因子为核心的数据基础设施，支撑三级影响体系（个股/板块/市场），使策略能够同时使用技术因子和事件因子生成交易信号。

## Goals / Non-Goals

**Goals:**
- 构建可配置的三级事件采集管道（个股新闻/公告、板块政策、市场宏观/国际事件）
- 实现日级事件因子聚合，并与技术指标对齐生成因子快照
- 实现策略管理（CRUD + 版本 + 参数 Schema），取代硬编码策略
- 改造回测引擎以 factor_snapshots 为输入，支持参数化策略
- 提供管理后台：数据源配置、采集任务审计、提取规则版本管理

**Non-Goals:**
- 不实现 AI 策略生成/代码编辑器（保留到 V2）
- 不接入 Wind/Choice 等付费机构数据（预留适配器接口，MVP 用 Fallback）
- 不实现实时 WebSocket 推送（前端轮询即可）
- 不回测 tick 级数据
- LangGraph Agents 集成（后续 Phase 对接）

## Decisions

### 1. 事件模型：三级分层 + 统一存储

所有事件（无论来源）统一存入 `events` 表，通过 `scope` 字段区分级别：`individual`（个股）、`sector`（板块）、`market`（市场）。

**Why**: 避免为每级事件维护独立表，查询和扩展更简单。板块级事件通过 `sector` 字段 + 证监会行业分类映射表关联到个股。

**Alternatives considered**: 三级独立表（`individual_events`, `sector_events`, `market_events`）— 查询复杂，JOIN 多，放弃。

### 2. 日级聚合：event_factors 表

事件按 `symbol + trade_date` 日级聚合为 `event_factors`，包含 `individual_events`、`sector_events`、`market_events` 三个 JSON 字段 + `composite` 综合得分。

**Why**: 策略回测使用日线数据，日级聚合天然对齐。JSON 列结构灵活，支持后续新增事件维度而不改表结构。

**Alternatives considered**: 单条事件直接参与回测 — 一天10条新闻导致策略噪声大、去重难。分钟级聚合 — 现有 K 线是日级的，对齐复杂。

### 3. 数据源按"类型"配置

一个 `EventSource` 配置覆盖多只股票（如"东方财富个股新闻"自动遍历股票池），而非每只股票一个配置。

**Why**: 配置数量从 O(n) 降到 O(1)，管理简单。股票池通过 `config.stock_pool` 定义（watchlist + 回测过的股票）。

### 4. 去重策略：标题相似度（text distance > 0.85）

使用 `difflib.SequenceMatcher` 或 `rapidfuzz` 计算标题相似度，> 0.85 视为重复。

**Why**: 同一事件在不同来源标题略有差异（如"茅台业绩预告" vs "贵州茅台发布业绩预告"），URL 去重会漏掉。相似度覆盖这种情况。

**Trade-off**: 计算成本略高于 URL hash，但准确性高。MVP 数据量不大，可接受。

### 5. 情感分析：关键词词典（MVP）+ 可替换接口

MVP 使用预定义正负关键词词典（100-200 个词）+ 简单计分公式。规则存储在 `event_rules` 表中，可版本切换。

**Why**: 零外部依赖、可解释、可人工调整。预留 `sentiment_extractor` 接口，后续可无缝替换为 DeepSeek API 或 BERT 模型。

### 6. 回测输入：factor_snapshots 替代原始价格

回测引擎不再直接从 `stock_daily_prices` + 实时计算指标获取数据，而是从 `factor_snapshots` 读取已对齐的技术因子 + 事件因子。

**Why**: 确保可回放（deterministic）— 同一日期同一股票的因子值固定，不依赖计算时的代码版本。便于后续 AI 诊断使用相同数据。

**Trade-off**: 需要预先生成 snapshot，首次回测某段历史时如果 snapshot 不存在需要实时生成。

### 7. 板块映射：证监会行业分类

使用证监会行业分类标准（19 个一级行业 + 更多二级）建立 `stock_sector_mappings` 映射表。

**Why**: 国内最权威的官方分类，akshare 可直接获取。申万分类更细但更新频繁，MVP 用证监会更稳定。

### 8. 策略参数化：内置策略标识 + params_schema

MVP 策略逻辑仍为内置 Python 类（`MACrossStrategy` 等），但策略定义通过 `strategies` 表管理，参数通过 `params_schema` 结构化定义。

**Why**: 立即解决"硬编码"问题，用户可调参运行不同变体（如 MA5/MA10 vs MA5/MA20）。为 V2 的代码编辑/AI 生成保留扩展空间。

### 9. 异步回测：预留字段，MVP 同步执行

`backtest_tasks` 表保留 `status`、`progress` 字段，但 MVP 回测 API 同步返回结果。

**Why**: 个人版、单用户、MVP 阶段策略简单，回测通常几秒完成。引入 Celery 增加复杂度。表结构预留，后续无痛升级。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 事件采集源不稳定（akshare 接口变更） | 每个采集器独立封装，接口变更只需改一处；采集失败记录到 `event_jobs` 日志，不阻塞其他源 |
| 情感词典精度有限 | 规则版本化管理，可快速迭代关键词；预留模型接口后续升级 |
| factor_snapshots 数据量大（5000+ 股票 × 交易日） | 只生成用户关注股票池的 snapshot；旧数据可归档 |
| 板块映射表过时 | 定期从 akshare 同步更新；用户可在规则管理中手动修正 |
| 国际事件抓取复杂 | MVP 先用预定义日历 + API 抓取；复杂源后续迭代 |

## Migration Plan

1. **数据库迁移**: Alembic 新增表 + 改造 `strategy_backtests` → `backtest_tasks`
2. **数据填充**: 
   - 初始化 `event_sources`（内置 5-6 个数据源配置）
   - 初始化 `event_rules`（情感词典 v1、分类规则 v1、板块映射 v1）
   - 从 akshare 同步证监会行业分类映射表
   - 批量生成历史 `factor_snapshots`（对用户 watchlist 股票）
3. **API 切换**: 新路由并行运行，旧路由逐步废弃
4. **前端切换**: 新页面开发完成后，路由替换
5. **Rollback**: 保留旧表（`strategy_backtests` 改名备份），新表出问题可快速回滚

## Open Questions

- 国际事件 API 具体用哪个？（FRED、AlphaVantage、还是手动维护的日历？）→ MVP 先用手动日历 + akshare 宏观数据
- 股票池范围动态增长策略是否 OK？（watchlist + 回测过的股票）→ 已确认 OK
