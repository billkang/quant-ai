# Event Factor 事件因子系统规格

## 功能概述

构建可配置的三级事件采集管道（个股/板块/市场），将原始新闻/公告/宏观数据转化为结构化事件信号，日级聚合为可参与策略计算的事件因子。

## API 接口

所有端点使用 `success_response` 统一包装响应。

### 事件查询
```
GET /api/events?symbol=&sector=&scope=&source_type=&start_date=&end_date=&limit=50
```
支持过滤：股票代码、板块、范围(individual/sector/market)、来源类型、日期范围。

### 编辑/删除事件
```
PUT /api/events/{id}
DELETE /api/events/{id}
```
编辑或删除后会触发关联 `event_factors` 的重新生成。

### 数据源配置
```
GET /api/event-sources
POST /api/event-sources
PUT /api/event-sources/{id}
DELETE /api/event-sources/{id}
POST /api/event-sources/{id}/trigger   -- 手动触发采集
```

### 采集任务日志
```
GET /api/event-jobs?limit=50
GET /api/event-jobs/{id}
```

### 提取规则管理
```
GET /api/event-rules
POST /api/event-rules
PUT /api/event-rules/{id}
POST /api/event-rules/{id}/activate   -- 激活新版本（同类型旧版本自动失效）
```

## 数据模型

### events 表
- id, source_id (FK), scope (individual/sector/market)
- symbol, sector, title, summary, content, url
- publish_time, sentiment (-1~1), strength (0~1), certainty (0~1), urgency (0~1)
- duration, tags (JSON), signals (JSON), is_edited
- created_at

### event_sources 表
- id, name, source_type, scope, config (JSON), schedule
- enabled, last_fetched_at, last_error, created_at, updated_at

### event_jobs 表
- id, source_id (FK), status (running/success/failed)
- new_events_count, duplicate_count, error_count
- logs, error_message, started_at, completed_at

### event_rules 表
- id, name, rule_type (sentiment_extractor/classifier/sector_mapper)
- version, config (JSON), is_active, created_at, updated_at

### event_factors 表
- id, symbol, trade_date
- individual_events (JSON), sector_events (JSON), market_events (JSON)
- composite, created_at, updated_at

### stock_sector_mappings 表
- id, stock_code (unique), stock_name, sector, sector_code
- industry_level1, industry_level2, source, updated_at

## 核心流程

1. **采集**: 调度器定时运行 `StockNewsFetcher` / `StockNoticeFetcher` / `MacroDataFetcher`
2. **去重**: 标题相似度 > 0.85 (SequenceMatcher) 视为重复
3. **提取**: 关键词词典情感分析 + 规则分类器 + 板块映射
4. **聚合**: 每日按 `symbol + trade_date` 汇总为 `event_factors`

## 状态

✅ 已完成
