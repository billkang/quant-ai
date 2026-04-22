# News 资讯聚合主规格

## 功能概述

提供股票新闻、公告、宏观资讯的聚合和管理。新闻数据持久化存储，支持去重和增量拉取。

## API 接口

### 获取资讯列表（从数据库）
```
GET /api/news?category={all|stock|macro}&symbol={code}
```
- category: all (默认), stock, macro — **当前未实现过滤逻辑**
- symbol: 股票代码 (可选)

Response: 直接返回数组 (无 success_response 包装)
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
> **注意**: 当前仅支持按 `symbol` 查询，传入 symbol 时调用 `get_stock_news_from_db(symbol)`，否则返回空数组。`category` 参数被忽略。

### 获取数据源列表
```
GET /api/news/sources
```
Response:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "贵州茅台",
      "sourceType": "stock_news",
      "config": { "symbol": "600519" },
      "intervalMinutes": 60,
      "enabled": true,
      "lastFetchedAt": "2024-01-15T10:30:00"
    }
  ],
  "message": "ok"
}
```

### 添加数据源
```
POST /api/news/sources
```
Body (BaseModel):
```json
{
  "name": "贵州茅台",
  "source_type": "stock_news",
  "config": { "symbol": "600519" },
  "interval_minutes": 60
}
```

### 更新数据源
```
PUT /api/news/sources/{id}
```
Query params: `name`, `source_type`, `config`, `interval_minutes`, `enabled`

### 删除数据源
```
DELETE /api/news/sources/{id}
```

### 手动拉取（带判重）
```
POST /api/news/sources/{id}/fetch
```
Response: 直接返回 service 结果 (无 success_response 包装)
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

## 数据类型

| 类型 | 说明 |
|------|------|
| stock_news | 股票新闻 |
| stock_notices | 股票公告 |
| macro_news | 宏观资讯 |

## 数据模型

### news_sources 表
- id: 主键
- name: 数据源名称
- source_type: 类型
- config: 配置 (JSON)
- interval_minutes: 拉取周期
- enabled: 是否启用 (Integer: 1/0)
- last_fetched_at: 上次拉取时间
- created_at: 创建时间

### news_articles 表
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
- 科创50 (000688) - interval: 30
- 贵州茅台 (600519) - interval: 60
- 宁德时代 (300750) - interval: 60
- 腾讯控股 (00700.HK) - interval: 60
- 阿里巴巴 (9988.HK) - interval: 60

## 状态

✅ 核心功能已完成

## 遗留问题

1. `GET /api/news` 的 `category` 参数未实现过滤逻辑。
2. 新闻页面中"股票公告"和"宏观资讯"标签页为空实现/开发中提示。
3. `POST /api/news/sources/{id}/fetch` 直接返回 service 结果，未统一使用 success_response 包装。