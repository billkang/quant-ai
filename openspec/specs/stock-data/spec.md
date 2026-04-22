# Stock Data 主规格

## 功能概述

提供 A 股和港股的行情数据采集、存储和展示。

## 技术实现

| 组件 | 技术 |
|------|------|
| A股数据 | AkShare |
| 港股/美股数据 | yfinance |
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
> **注意**: 当前使用 query param 传递参数，未使用 BaseModel Request Body。添加成功后会自动拉取并保存 K线数据 (period=6mo)。

Response:
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
> 字段名和结构取决于 akshare/yfinance 原始返回。

### 获取 K 线
```
GET /api/stocks/600519/kline?period=daily
```
支持周期: daily, weekly, monthly, 1mo, 6mo, 1y (后端透传给数据源)
Response: 直接返回 K线数组

## 数据模型

### stocks 表
- id: 主键
- code: 股票代码 (唯一)
- name: 股票名称
- market: 市场 (A/HK/US)
- created_at: 创建时间

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

## 遗留问题

- `POST /api/stocks/watchlist` 应改为 BaseModel Request Body 以符合项目规范。