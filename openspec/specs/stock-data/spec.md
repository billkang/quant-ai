# Stock Data 主规格

## 功能概述

提供 A 股和港股的行情数据采集、存储和展示。

## 技术实现

| 组件 | 技术 |
|------|------|
| A股数据 | AkShare |
| 港股数据 | yfinance |
| K线存储 | PostgreSQL (stock_kline 表) |
| 实时缓存 | Redis |

## API 接口

### 获取自选股列表
```
GET /api/stocks/watchlist
```
Response:
```json
[
  { "code": "600519", "name": "贵州茅台", "price": 1850.00, "change": 25.00, "changePercent": 1.37 }
]
```

### 添加自选股
```
POST /api/stocks/watchlist?stock_code=600519
```

### 删除自选股
```
DELETE /api/stocks/watchlist/600519
```

### 获取股票行情
```
GET /api/stocks/600519
```
Response:
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

### 获取 K 线
```
GET /api/stocks/600519/kline?period=6mo
```
支持周期: daily, weekly, monthly, 1mo, 6mo, 1y

## 数据模型

### stocks 表
- id: 主键
- code: 股票代码 (唯一)
- name: 股票名称
- market: 市场 (A/HK/US)

### watchlist 表
- id: 主键
- stock_code: 股票代码
- stock_name: 股票名称
- added_at: 添加时间

### stock_kline 表
- id: 主键
- stock_code: 股票代码
- period: 周期
- data: K线数据 (JSON)
- updated_at: 更新时间

## 状态

✅ 已完成