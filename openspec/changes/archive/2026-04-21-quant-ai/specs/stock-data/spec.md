# Stock Data 规格说明

## 功能概述

提供 A 股和港股的行情数据采集、存储和展示功能。

## API 接口

### 获取自选股列表行情
```
GET /api/stocks/watchlist
```
- 返回：股票代码、名称、现价、涨跌、涨跌幅

### 添加自选股
```
POST /api/stocks/watchlist
Body: { name, source_type, config, interval_minutes }
```
- 参数：stock_code (query)

### 删除自选股
```
DELETE /api/stocks/watchlist/{code}
```

### 获取股票行情
```
GET /api/stocks/{code}
```
- 返回：股票名称、现价、开盘、最高、最低、成交量

### 获取 K 线数据
```
GET /api/stocks/{code}/kline?period={daily|weekly|monthly|1mo|6mo|1y}
```

## 状态

✅ 已完成