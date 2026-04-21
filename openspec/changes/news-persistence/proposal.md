## Why

当前资讯中心每次请求都实时调用 AkShare API，导致加载慢、体验差。新闻数据没有持久化存储，无法实现去重和增量拉取。用户刷新时每次都重复抓取相同数据。

## What Changes

1. 新增 `NewsArticle` 模型存储新闻内容到数据库
2. 修改 `GET /api/news` 从数据库读取，返回缓存数据
3. 抓取时检查 `last_fetched_at`，未超过间隔则跳过
4. 基于 `新闻链接` 实现去重逻辑
5. 添加字段映射转换（AkShare 字段 → 前端字段）

## Capabilities

### New Capabilities
- `news-persistence`: 新闻持久化存储和去重
- `news-fetch-scheduler`: 定时拉取任务（可选）

### Modified Capabilities
- `news`: `GET /api/news` 从实时抓取改为数据库读取；抓取 API 增加判重逻辑

## Impact

- `server/src/models/models.py` - 新增 NewsArticle 模型
- `server/src/models/crud.py` - 新增 CRUD 方法
- `server/src/services/news.py` - 修改返回逻辑
- `server/src/main.py` - 修改 API
- 前端 `News.tsx` - 字段适配（已基本完成）