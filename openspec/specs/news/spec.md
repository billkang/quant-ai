# News 资讯聚合主规格

## 功能概述

提供股票新闻、公告、宏观资讯的聚合和管理。

## API 接口

### 获取资讯列表
```
GET /api/news?category={all|stock|macro}&symbol={code}
```
- category: all (默认), stock, macro
- symbol: 股票代码 (可选)

### 获取数据源列表
```
GET /api/news/sources
```
Response:
```json
[
  {
    "id": 1,
    "name": "贵州茅台",
    "sourceType": "stock_news",
    "config": { "symbol": "600519" },
    "intervalMinutes": 60,
    "enabled": true,
    "lastFetchedAt": "2024-01-15T10:30:00"
  }
]
```

### 添加数据源
```
POST /api/news/sources
Body:
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
Body: { "enabled": false }
```

### 删除数据源
```
DELETE /api/news/sources/{id}
```

### 手动拉取
```
POST /api/news/sources/{id}/fetch
```
返回拉取的资讯数量和数据。

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
- enabled: 是否启用
- last_fetched_at: 上次拉取时间
- created_at: 创建时间

## 预设数据源

- 大盘行情 (000001)
- 创业板指 (399006)
- 科创板 (000688)
- 贵州茅台 (600519)
- 宁德时代 (300750)
- 腾讯控股 (00700.HK)
- 阿里巴巴 (9988.HK)

## 状态

✅ 已完成