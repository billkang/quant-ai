# News 资讯聚合（更新版）

## 功能概述

提供股票新闻、公告、宏观资讯的聚合和管理。新闻数据持久化存储，支持去重和增量拉取。

## API 接口

### 获取资讯列表（从数据库）
```
GET /api/news?category={all|stock|macro}&symbol={code}
```
Response:
```json
[
  {
    "id": "1",
    "title": "新闻标题",
    "summary": "新闻摘要...",
    "source": "文章来源",
    "time": "2024-01-15 10:30:00",
    "url": "https://..."
  }
]
```

### 手动拉取（带判重）
```
POST /api/news/sources/{id}/fetch
```
Response:
```json
{
  "status": "ok",
  "count": 10,
  "skipped": 0,
  "new": 10,
  "data": [...]
}
```
- `skipped`: 因间隔未到而跳过的次数
- `new`: 新增新闻数量

### 获取数据源列表
```
GET /api/news/sources
```

## 数据模型

### news_sources 表
- id: 主键
- name: 数据源名称
- source_type: 类型 (stock_news/stock_notices/macro_news)
- config: 配置 (JSON) - 包含 symbol 等
- interval_minutes: 拉取间隔（分钟）
- enabled: 是否启用
- last_fetched_at: 上次拉取时间
- created_at: 创建时间

### news_articles 表（新增）
- id: 主键
- source_id: 外键 → news_sources.id
- title: 标题
- summary: 摘要
- content: 内容（可选）
- source: 来源
- publish_time: 发布时间
- url: 链接（去重用，唯一）
- created_at: 入库时间

## 判重逻辑

```
抓取请求 → 检查 last_fetched_at
         │
         ├─ 未超过 interval → 返回 {skipped: true}
         │
         └─ 超过 interval → 抓取新数据
                              │
                              ↓
                      检查 url 是否已存在
                              │
                              ├─ 已存在 → 跳过
                              │
                              └─ 不存在 → 写入数据库
                                         更新 last_fetched_at
```

## 预设数据源

- 大盘行情 (000001) - interval: 30
- 创业板指 (399006) - interval: 30
- 科创板 (000688) - interval: 30
- 贵州茅台 (600519) - interval: 60
- 宁德时代 (300750) - interval: 60
- 腾讯控股 (00700.HK) - interval: 60
- 阿里巴巴 (9988.HK) - interval: 60

## 状态

✅ 已完成