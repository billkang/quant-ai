## Context

当前 `SchedulerService` 每日 16:00 执行一次自选股日线数据与指标更新，18:00 执行盘后新闻更新，`interval_news_fetch` 每 6 小时运行一次。所有任务均为"黑盒"执行：无持久化状态、无进度反馈、失败时仅写日志。用户无法感知任务执行情况，也无法在盘中获取最新行情和新闻。

本变更在现有 APScheduler + SQLAlchemy 基础上，叠加高频采集管道和任务进度追踪系统，不引入新的消息队列或外部依赖。

## Goals / Non-Goals

**Goals:**
- 盘中（交易时段）每 5 分钟采集自选股实时行情、大盘指数、板块数据
- 每小时增量拉取新闻数据（替代现有每 6 小时）
- 采集任务具备进度同步能力（状态、进度百分比、已处理/总数、错误日志）
- 前端可查看任务列表、实时进度、历史记录，支持手动触发和取消

**Non-Goals:**
- 不改造现有 WebSocket 实时行情推送（已有独立 capability）
- 不新增股票交易执行或下单能力
- 不扩展新的第三方数据源（继续使用 AkShare / yfinance）
- 不做分布式任务调度（单节点 APScheduler 足够）

## Decisions

### 1. 新建 `CollectionJob` 表，不复用 `EventJob`
- **Rationale**: `EventJob` 专属于事件因子管道（关联 `source_id`、记录 `new_events_count` 等语义），与通用采集任务进度模型职责不同。混用会导致耦合和歧义。
- **Alternative**: 扩展 `EventJob` 增加 `job_type` 字段 —  rejected，会破坏事件管道的数据完整性。

### 2. 进度同步采用"数据库轮询"模式
- **Rationale**: 采集任务运行在 APScheduler 的后台线程/协程中，前端通过 `GET /api/collection/jobs/{id}` 轮询（3-5 秒间隔）获取最新进度。实现简单，无需引入 WebSocket 或 SSE。
- **Alternative**: Redis Pub/Sub 推送进度 — rejected，增加复杂度且前端仍需消费端；当前变更频率（5 分钟级）不值得。

### 3. 盘中行情仅更新内存/Redis 缓存，不写入 `stock_daily_prices`
- **Rationale**: `stock_daily_prices` 是日级数据表，盘中频繁写入会产生大量非收盘价的脏数据，干扰指标计算和回测。盘中采集结果写入 Redis（TTL 5 分钟），前端 Dashboard 优先读 Redis，fallback 到数据库。
- **Alternative**: 写入 `stock_daily_prices` 并加 `is_intraday` 标记 — rejected，需要改造 indicator 计算和回测引擎过滤逻辑，影响面过大。

### 4. 取消任务使用内存标记 + 采集逻辑自检
- **Rationale**: APScheduler 的 `remove_job` 只能取消尚未执行的调度，无法中断正在运行的同步 Python 代码。实现 `ProgressReporter` 对象持有 `cancelled` 标志，采集循环每处理一个股票后检查该标志，若置位则优雅退出并更新 job 状态为 `cancelled`。
- **Alternative**: 使用多进程 + `Process.terminate()` — rejected，引入进程管理和数据序列化复杂度，且可能导致数据库连接泄漏。

### 5. 大盘与板块数据使用 AkShare 接口
- **Rationale**: 大盘指数使用 `akshare.index_zh_a_spot_em()` 获取实时指数行情；板块数据使用 `akshare.stock_board_industry_name_ths()` 获取行业板块列表和涨跌幅。数据存入 Redis（hash key: `market:indices`, `market:sectors`）。
- **Alternative**: 使用现有 `stock_service.get_a_stock_quote` 逐个股查询大盘指数 — rejected，效率低且非官方指数代码可能不覆盖。

## Risks / Trade-offs

- **[Risk] 5 分钟高频采集触发 AkShare/东方财富 API 限流** → **Mitigation**: 对同一接口增加本地缓存（TTL 60 秒）；大盘和板块数据在 5 分钟窗口内缓存共享；失败时指数退避重试（1s, 2s, 4s）。
- **[Risk] 数据库连接池在高频任务下耗尽** → **Mitigation**: `CollectionJob` 的创建和更新使用短生命周期 session（`with SessionLocal() as db`），任务执行完毕后立即关闭；进度更新批量 commit（每 10 只股票或任务结束时）。
- **[Risk] 任务重叠（上一个 5 分钟任务尚未完成）** → **Mitigation**: APScheduler 默认 `max_instances=1`，同类型任务不会重叠执行；若任务超时（> 5 分钟），则跳过本次调度并在日志中记录 warning。
- **[Risk] Redis 未配置或宕机时盘中行情不可用** → **Mitigation**: 前端 Dashboard 读取盘中行情时 fallback 到最近日级数据 + 显示"数据非实时"提示；采集任务本身不依赖 Redis 写进度（进度写入 PostgreSQL）。
- **[Trade-off] 进度轮询增加前端请求量** → 每次采集持续时间短（< 30 秒），轮询窗口有限；页面非高频访问，影响可接受。

## Migration Plan

1. **数据库**: 执行 Alembic migration 创建 `collection_jobs` 表
2. **后端**: 部署新版 `scheduler.py`（新增高频任务）和 `collection.py` API；重启 server 容器后 APScheduler 自动加载新任务
3. **前端**: 部署新页面 `CollectionJobs.tsx` 和导航入口
4. **回滚**: 若出现问题，回滚到上一版本镜像；`collection_jobs` 表保留不影响旧代码（新表无外部引用）

## Open Questions

1. 板块数据是否需要持久化到 PostgreSQL，还是仅 Redis 缓存即可？（当前设计仅 Redis，若后续需历史板块分析再扩展）
2. 港股/美股自选股是否纳入 5 分钟采集？（当前仅 A 股，因 yfinance 有调用频率限制）
