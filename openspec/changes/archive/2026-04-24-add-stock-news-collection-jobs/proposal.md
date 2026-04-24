## Why

当前系统的数据采集主要依赖每日收盘后的一次性批量更新（16:00 日线数据 + 18:00 盘后新闻），缺乏盘中高频采集能力。用户无法实时感知自选股行情变化、大盘指数和板块异动，新闻数据 6 小时间隔也导致资讯时效性不足。此外，所有调度任务均为"黑盒"执行，失败或卡住时无状态可查。因此需要建立高频采集管道和任务进度可视化能力，提升数据时效性和系统可观测性。

## What Changes

- **新增高频股票采集调度任务**：每 5 分钟采集自选股实时行情、大盘指数（上证指数/深证成指/创业板指）、板块涨跌数据
- **提升新闻采集频率**：将现有定时新闻采集从每 6 小时调整为每小时增量拉取
- **新增采集任务进度追踪系统**：引入 `collection_jobs` 表记录每次采集任务的执行状态、进度百分比、已处理/总数、开始/结束时间、错误日志
- **新增采集任务管理 API**：`GET /api/collection/jobs` 任务列表、`GET /api/collection/jobs/{id}` 详情、`POST /api/collection/jobs/{id}/cancel` 取消任务、`POST /api/collection/jobs/trigger` 手动触发
- **新增前端采集任务监控页面**：独立页面 `/collection-jobs`，实时展示任务进度条、状态徽章、执行日志、支持手动触发和取消
- **改造现有 SchedulerService**：采集逻辑接入进度上报机制（ProgressReporter），支持原子化更新 job 状态
- **BREAKING**: `interval_news_fetch` 触发间隔从 `hour="*/6"` 改为 `hour="*", minute=0`（每小时）

## Capabilities

### New Capabilities
- `collection-job-progress`: 采集任务进度追踪与状态管理（数据模型、CRUD API、进度同步机制、前端监控页面）
- `collection-scheduler`: 高频股票与新闻采集调度（每 5 分钟股票行情/大盘/板块采集、每小时新闻增量采集、手动触发接口）

### Modified Capabilities
- `news`: 定时新闻采集间隔从每 6 小时调整为每小时，调度器 CronTrigger 配置变更

## Impact

- **后端**: `server/src/services/scheduler.py` 增加高频任务和进度上报；新增 `server/src/api/collection.py`；新增 `CollectionJob` 模型及 Alembic migration；`server/src/models/crud.py` 增加 job CRUD
- **前端**: 新增 `client/src/pages/CollectionJobs.tsx`；`Layout.tsx` 导航新增"采集任务"入口；`App.tsx` 新增路由
- **数据库**: 新增 `collection_jobs` 表（id, job_type, status, progress, total_items, processed_items, start_time, end_time, error_log, created_at, updated_at）
- **依赖**: 无新增外部依赖，复用现有 APScheduler + SQLAlchemy + React
- **部署**: Docker Compose 无需调整，scheduler 随 server 容器自动启动
