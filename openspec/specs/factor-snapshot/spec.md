# Factor Snapshot 因子快照规格

## 功能概述

生成每日 `factor_snapshots`，将技术指标和事件因子按 `trade_date` 对齐，为回测引擎和 AI 诊断提供统一、可回放的输入数据。

## API 接口

所有端点使用 `success_response` 统一包装响应。

### 生成快照
```
POST /api/factors/snapshots/generate
```
Body:
```json
{
  "symbol": "600519",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31"
}
```
若省略日期范围，则生成最新一天。

### 查询快照历史
```
GET /api/factors/snapshots/600519?start=2025-01-01&end=2025-01-31
```

### 查询最新快照
```
GET /api/factors/snapshot/latest?symbol=600519
```

## 数据模型

### factor_snapshots 表
- id, symbol, trade_date
- technical (JSON): 包含 ma5/10/20/60, rsi6/12/24, macd_dif/dea/bar, kdj_k/d/j, boll_upper/mid/lower, vol_ma5/10
- events (JSON): 包含 individual/sector/market events 和 composite score
- price (JSON): 包含 open, high, low, close, volume, amount
- created_at, updated_at

## DataFrame 列结构

回测引擎接收的 DataFrame 包含：
- OHLCV: `open`, `high`, `low`, `close`, `volume`
- 技术指标: `ma5`, `ma10`, `rsi6`, `macd_dif`, ...
- 事件因子: `avg_sentiment`, `event_strength`, `news_count`, `sector_sentiment`, `market_sentiment`, `composite`

## 状态

✅ 已完成
