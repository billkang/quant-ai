# Stock Data 主规格

## 功能概述

提供 A 股和港股的行情数据采集、存储和展示。

## 技术实现

| 组件 | 技术 |
|------|------|
| A股数据 | AkShare (Eastmoney API) |
| 港股/美股数据 | yfinance (Yahoo Finance API) |
| K线存储 | PostgreSQL (stock_kline 表) |
| 实时缓存 | Redis (60s TTL) |

## API 接口

### 获取自选股列表
```
GET /api/stocks/watchlist
```
Response: 直接返回数组 (无 success_response 包装)
```json
[
  { "code": "600519", "name": "贵州茅台", "price": 1850.00, "change": 25.00, "changePercent": 1.37 }
]
```

### 添加自选股
```
POST /api/stocks/watchlist?stock_code=600519
```
> **实现方式**: 使用 query param `stock_code` 传递参数，未使用 BaseModel Request Body。
> 添加成功后会自动拉取并保存 K线数据 (period=6mo)。

Response (success_response 包装):
```json
{
  "code": 0,
  "data": { "stock_code": "600519", "name": "贵州茅台" },
  "message": "ok"
}
```

### 删除自选股
```
DELETE /api/stocks/watchlist/600519
```
Response:
```json
{ "code": 0, "data": null, "message": "ok" }
```

### 获取股票行情
```
GET /api/stocks/600519
```
Response: 直接返回 dict (无 success_response 包装)
```json
{
  "code": "600519",
  "name": "贵州茅台",
  "price": 1850.00,
  "open": 1820.00,
  "high": 1860.00,
  "low": 1810.00,
  "volume": 125000000
}
```
> 字段名和结构取决于 akshare/yfinance 原始返回。A股通过 Eastmoney API 获取，港股/美股通过 Yahoo Finance 获取。

### 获取 K 线
```
GET /api/stocks/600519/kline?period=daily
```
支持周期: daily, weekly, monthly (A股); 1d, 1mo, 3mo, 6mo, 1y (港股/美股)
Response: 直接返回 K线数组

### 查询事件因子
```
GET /api/stocks/600519/event-factors?start=2025-01-01&end=2025-01-31
```
Response:
```json
{
  "code": 0,
  "data": [
    {
      "symbol": "600519",
      "tradeDate": "2025-01-15",
      "individualEvents": { "news_count": 5, "avg_sentiment": 0.45 },
      "sectorEvents": { "avg_sentiment": 0.12 },
      "marketEvents": { "avg_sentiment": -0.05 },
      "composite": 0.23
    }
  ],
  "message": "ok"
}
```

### 查询股票板块
```
GET /api/stocks/600519/sector
```
Response:
```json
{
  "code": 0,
  "data": { "sector": "酒、饮料和精制茶制造业", "sectorCode": "C15" },
  "message": "ok"
}
```

## 数据模型

### stocks 表
- id (Integer, PK)
- code (String(20), unique, index)
- name (String(100))
- market (String(10))
- created_at (DateTime)

### watchlist 表
- id (Integer, PK)
- stock_code (String(20), index)
- stock_name (String(100))
- added_at (DateTime)

### stock_kline 表
- id (Integer, PK)
- stock_code (String(20), index)
- period (String(10))
- data (JSON)
- updated_at (DateTime)

## 状态

✅ 已完成